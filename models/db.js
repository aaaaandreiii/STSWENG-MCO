const mongoose = require("mongoose");
const url = process.env.DB_URL;

//remove depracated warnings
// const options = {
//     useUnifiedTopology: true,
//     useNewUrlParser: true,
// };

function redact(u = "") {
  return (u || "").replace(/\/\/([^:@]+):([^@]+)@/, "//***:***@");
}

function wireConnectionEvents() {
  const c = mongoose.connection;
  c.on("connecting", () => console.log("[DB] connecting…", redact(url)));
  c.on("connected", () => console.log("[DB] connected:", c.host, c.name));
  c.on("reconnected", () => console.log("[DB] reconnected"));
  c.on("disconnected", () => console.warn("[DB] disconnected"));
  c.on("error", (err) => console.error("[DB] error:", err.message));
}

const database = {
  connect: async function () {
    if (!url) {
      console.error("[DB] DB_URL is missing in environment.");
      throw new Error("DB_URL not set");
    }
    wireConnectionEvents();
    const started = Date.now();
    console.log("[DB] connect called with", redact(url));
    try {
      await mongoose.connect(url);

      //remove depracated warnings: useUnifiedTopology, useNewUrlParser
      // await mongoose.connect(url, options);

      // console.log('Connected!');
      console.log(`[DB] ready in ${Date.now() - started}ms`);
    } catch (err) {
      console.error("[DB] failed to connect:", err.message);
      throw err;
    }
  },

  disconnect: async function () {
    await mongoose.disconnect();
    console.log("Disconnected!");
  },

  // TODO: Add other CRUD functions here:
  // - insertOne / insertMany (Create)
  // - findOne / findAll (Read)
  // - updateOne / updateMany (Update)
  // - deleteOne / deleteMany (Delete)
  // - count

  // FULLY ACCOMPLISHED CRUD FUNCTIONS:

  //Adjustments made for Mongoose 7

  insertOne: function (model, doc, callback) {
    model
      .create(doc)
      .then((result) => {
        console.log("Added " + result);
        return callback(true); // same behaviour as before
      })
      .catch((error) => {
        console.error("[DB] insertOne error:", error);
        return callback(false);
      });
  },

  insertMany: function (model, docs, callback) {
    model
      .insertMany(docs)
      .then((result) => {
        console.log("Added " + result);
        return callback(true);
      })
      .catch((error) => {
        console.error("[DB] insertMany error:", error);
        return callback(false);
      });
  },

  findOne: function (model, query, projection, callback) {
    model
      .findOne(query, projection)
      .then((result) => {
        return callback(result);
      })
      .catch((error) => {
        console.error("[DB] findOne error:", error);
        return callback(false);
      });
  },

  findMany: function (model, query, projection, callback) {
    model
      .find(query, projection)
      .then((result) => {
        return callback(result); // array of docs
      })
      .catch((error) => {
        console.error("[DB] findMany error:", error);
        return callback(false);
      });
  },

  updateOne: function (model, filter, update, callback) {
    model
      .findOneAndUpdate(filter, update, { new: true })
      .then((result) => {
        console.log("Document modified");
        return callback(result);
      })
      .catch((error) => {
        console.error("[DB] updateOne error:", error);
        return callback(false);
      });
  },

  updateMany: function (model, filter, update, callback) {
    model
      .updateMany(filter, update)
      .then((result) => {
        const modified =
          typeof result.modifiedCount !== "undefined"
            ? result.modifiedCount
            : result.nModified;

        console.log("Documents modified: " + modified);

        if (
          typeof result.nModified === "undefined" &&
          typeof result.modifiedCount !== "undefined"
        ) {
          result.nModified = result.modifiedCount;
        }

        return callback(result);
      })
      .catch((error) => {
        console.error("[DB] updateMany error:", error);
        return callback(false);
      });
  },

  deleteOne: function (model, conditions, callback) {
    model
      .deleteOne(conditions)
      .then((result) => {
        console.log("Document deleted: " + result.deletedCount);
        return callback(true);
      })
      .catch((error) => {
        console.error("[DB] deleteOne error:", error);
        return callback(false);
      });
  },

  deleteMany: function (model, conditions, callback) {
    model
      .deleteMany(conditions)
      .then((result) => {
        console.log("Document deleted: " + result.deletedCount);
        return callback(result.deletedCount);
      })
      .catch((error) => {
        console.error("[DB] deleteMany error:", error);
        return callback(false);
      });
  },

  count: function (model, query, callback) {
    model
      .countDocuments(query)
      .then((result) => {
        console.log("Documents: " + result);
        return callback(result);
      })
      .catch((error) => {
        console.error("[DB] count error:", error);
        return callback(false);
      });
  },
};

module.exports = database;
