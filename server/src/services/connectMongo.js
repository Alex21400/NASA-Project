const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URL = process.env.MONGO_URL;

mongoose.connection.once('open', () => {
    console.log('MongoDB connected');
});

mongoose.connection.on('error', (error) => {
    console.log('MongoDB error: ', error);
});

async function connectMongo() {
    await mongoose.connect(MONGO_URL);
}

async function disconnectMongo() {
    await mongoose.disconnect();
}

module.exports = {
    connectMongo,
    disconnectMongo
}