const {Application, Module, Modules: {readdirp}} = require('mf-lib');
const GenericApi = require('./GenericApi');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

/**
 * @type DatabaseModule
 */
class DatabaseModule extends Module {
    GenericApi = GenericApi;
    _connections = {};

    async init() {
        this.registerModel = this.registerModel.bind(this);
        await this.initConnections();
    }

    async initModule(module) {
        if (module.data && module.data.models) {
            for (let [modelName, modelFnc] of Object.entries(module.data.models)) {
                await this.registerModel(modelName, modelFnc);
            }
        }
    }

    async postInit() {
        await this.registerModels();
    }

    async initConnections() {
        const connections = this.config.get('connections', {default: {host: 'localhost', port: 27017, database: 'test'}});
        for (const [name, {host, port, database}] of Object.entries(connections)) {
            this._connections[name] = mongoose.connect(`mongodb://${host}:${port}/${database}`, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
        }
    }

    async registerModels() {
        const modelPath = path.resolve(Application.dirname, "models");
        if (!fs.existsSync(modelPath)) {
            return;
        }

        for await (const {fullPath, path: fileName} of readdirp(modelPath, {fileFilter: "*.js"})) {
            try {
                const model = require(fullPath);
                await this.registerModel(model);
            } catch (e) {
                this.log.error("failed to load model", fileName);
            }
        }
    }

    async registerModel(modelName, model) {
        try {
            let schema = model;
            if (model instanceof Function) {
                schema = await model(this.app);
            } else if (!model instanceof mongoose.Schema) {
                schema = new mongoose.Schema(model);
            }

            return mongoose.model(modelName, schema);
        } catch (e) {
            this.log.error('Failed to register model ' + modelName, e);
        }
    }

    getModel(modelName, connection = "default") {
        return mongoose.model(modelName);
    }
}

module.exports = DatabaseModule;
