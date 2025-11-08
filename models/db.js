const mongoose = require('mongoose');

const url = process.env.DB_URL;

//remove depracated warnings
// const options = {
//     useUnifiedTopology: true,
//     useNewUrlParser: true,
// };

function redact(u = '') {
    return (u || '').replace(/\/\/([^:@]+):([^@]+)@/, '//***:***@');
}

function wireConnectionEvents() {
    const c = mongoose.connection;
    c.on('connecting', () => console.log('[DB] connecting…', redact(url)));
    c.on('connected',  () => console.log('[DB] connected:', c.host, c.name));
    c.on('reconnected',() => console.log('[DB] reconnected'));
    c.on('disconnected',() => console.warn('[DB] disconnected'));
    c.on('error',      (err) => console.error('[DB] error:', err.message));
}

const database = {
    connect: async function() {
        if (!url) {
            console.error('[DB] DB_URL is missing in environment.');
            throw new Error('DB_URL not set');
        }
        wireConnectionEvents();
        const started = Date.now();
        console.log('[DB] connect called with', redact(url));
        try {
            await mongoose.connect(url);

            //remove depracated warnings: useUnifiedTopology, useNewUrlParser
            // await mongoose.connect(url, options);

            // console.log('Connected!');
            console.log(`[DB] ready in ${Date.now() - started}ms`);
        } catch (err) {
            console.error('[DB] failed to connect:', err.message);
            throw err;
        }
    },

    disconnect: async function() {
        await mongoose.disconnect();
        console.log('Disconnected!');
    },

    // TODO: Add other CRUD functions here:
    // - insertOne / insertMany (Create)
    // - findOne / findAll (Read)
    // - updateOne / updateMany (Update)
    // - deleteOne / deleteMany (Delete)
    // - count

    // FULLY ACCOMPLISHED CRUD FUNCTIONS:

    insertOne: function (model, doc, callback) {
        model.create(doc, function (error, result) {
            if (error) return callback(false);
            console.log('Added ' + result);
            return callback(true);
        });
    },

    insertMany: function (model, docs, callback) {
        model.insertMany(docs, function (error, result) {
            if (error) return callback(false);
            console.log('Added ' + result);
            return callback(true);
        });
    },

    findOne: function (model, query, projection, callback) {
        model.findOne(query, projection, function (error, result) {
            if (error) return callback(false);
            return callback(result);
        });
    },

    findMany: function (model, query, projection, callback) {
        model.find(query, projection, function (error, result) {
            if (error) return callback(false);
            return callback(result);
        });
    },

    updateOne: function (model, filter, update, callback) {
        model.findOneAndUpdate(filter, update, function (error, result) {
            if (error) return callback(false);
            console.log('Document modified: ' + result.nModified);
            return callback(result);
        });
    },

    updateMany: function (model, filter, update, callback) {
        model.updateMany(filter, update, function (error, result) {
            if (error) return callback(false);
            console.log('Documents modified: ' + result.nModified);
            return callback(result);
        });
    },

    deleteOne: function (model, conditions, callback) {
        model.deleteOne(conditions, function (error, result) {
            if (error) return callback(false);
            console.log('Document deleted: ' + result.deletedCount);
            return callback(true);
        });
    },

    deleteMany: function (model, conditions, callback) {
        model.deleteMany(conditions, function (error, result) {
            if (error) return callback(false);
            console.log('Document deleted: ' + result.deletedCount);
            return callback(result.deletedCount);
        });
    },

    count: function (model, query, callback) {
        model.countDocuments(query, function (error, result) {
            if (error) return callback(false);
            console.log('Documents: ' + result);
            return callback(result);
        });
    },
};

module.exports = database;