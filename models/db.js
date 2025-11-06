const mongoose = require("mongoose");
const url = process.env.DB_URL;
// const options = {
//     useUnifiedTopology: true,
//     useNewUrlParser: true,
// };

const database = {
  connect: async function () {
    await mongoose.connect(url);
    console.log("Connected!");
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
};

module.exports = database;
