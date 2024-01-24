const http = require('http');
const app = require('./app');

require('dotenv').config();

const { connectMongo } = require('./services/connectMongo');
const { loadPlanetsData } = require('./models/planets.model');
const { loadLaunchesData } = require('./models/launches.model');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

async function startServer() {
    await connectMongo();
    await loadPlanetsData();
    await loadLaunchesData();

    server.listen(PORT, () => {
        console.log(`Listening on PORT: ${PORT}`);
    });
}

startServer();

