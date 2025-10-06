const mongoose = require('mongoose');

//change this to ENV variable later
const url = "mongodb+srv://admin:admin@cluster0.0vhklxp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
};

const database = {
    connect: async function () {
        await mongoose.connect(url, options);
        console.log('Connected!');
    },

    disconnect: async function () {
        await mongoose.disconnect();
        console.log('Disconnected!');
    },
};

module.exports = database;