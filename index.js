const DatabaseModule = require('./lib/DatabaseModule');

module.exports = {
    module: DatabaseModule,
    data: {
        apis: [
            require('./apis/v0.1')
        ]
    }
};
