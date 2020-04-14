/**
 * Generic api class for crud-operations on mongoose models.
 * @type {GenericApi}
 */
module.exports = class GenericApi {
    /**
     * Create new doc of model
     * @param ctx
     * @param model
     * @param data
     * @return {Promise<*>}
     */
    static async create(ctx, model, data) {
        ctx.can('create', model);
        const genericModel = ctx.application.getModule('database').getModel(model);
        const doc = new genericModel(data);
        await doc.save();
        return doc;
    }

    /**
     * Get doc of model by id
     * @param ctx
     * @param model
     * @param id
     * @return {Promise<*>}
     */
    static async get(ctx, model, id) {
        ctx.can('find', model);
        const genericModel = ctx.application.getModule('database').getModel(model);
        const doc = await genericModel.findOne({_id: id}).lean();
        if (!doc) {
            ctx.status = 404;
            return 'Not found.';
        }
        return doc;
    }

    /**
     * Find docs of model by query
     * @param ctx
     * @param {string} model
     * @param {object} query
     * @param {number} page
     * @param {number} limit
     * @return {Promise<[*]>}
     */
    static async find(ctx, model, query, page = 0, limit = 20) {
        ctx.can('find', model);
        const genericModel = ctx.application.getModule('database').getModel(model);
        return genericModel.find(query).skip(page * limit).limit(limit).lean();
    }

    /**
     * Update doc of model by id
     * @param ctx
     * @param model
     * @param id
     * @param data
     * @return {Promise<*>}
     */
    static async update(ctx, model, id, data) {
        ctx.can('update', model);
        const genericModel = ctx.application.getModule('database').getModel(model);
        const doc = await genericModel.findOne({_id: id});
        if (!doc) {
            ctx.status = 404;
            return 'Not found.';
        }
        doc.set(data);
        await doc.save();
        return doc.toObject();
    }

    /**
     * Delete doc of model by id
     * @param ctx
     * @param model
     * @param id
     * @return {Promise<*>}
     */
    static async delete(ctx, model, id) {
        ctx.can('delete', model);
        const genericModel = ctx.application.getModule('database').getModel(model);
        const doc = await genericModel.findOne({_id: id});
        await doc.delete();
        return doc;
    }
};
