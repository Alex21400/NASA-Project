const launches = require('./launches.mongo');
const planets = require('./planets.mongo');

const axios = require('axios');

const DEFAULT_FLIGHT_NUMBER = 122;

const companies = ['Blue Origin', 'SpaceX', 'Virgin Galactic', 'Rocket Lab', 'Northrop Grumman',
'Sierra Space', 'Astroscale', 'Boeing', 'LeoLabs', 'ABL Space Systems', 'NASA', 'Maxar', 'GHGSat'];

function getRandomIndex(min, max) {
    return Math.floor((Math.random() * (max - min + 1)) + min);
}

function setRandomCustomers() {
    let customers = [];

    let firstIndex = getRandomIndex(0, 12);
    let secondIndex = getRandomIndex(0, 12);

    if(firstIndex !== secondIndex) {
        customers.push(companies[firstIndex]);
        customers.push(companies[secondIndex]);
    } else {
        customers.push(companies[firstIndex]);
    }

    return customers;
}

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches() {
    console.log('Downloading launches data...');
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: "rocket",
                    select: {
                        name : 1
                    }
                }, 
                {
                    path: "payloads",
                    select: {
                        customers: 1
                    }
                }
            ]
        }
    });

    if(response.status !== 200) {
        console.log('Problem with downloading launch data');
        throw new Error('Launch data download failed');
    }
    
    const launchDocs = response.data.docs;
    
    for(const doc of launchDocs) {
        const payloads = doc['payloads'];
        const customers = payloads.flatMap(payload => {
            return payload['customers'];
        });

        const launch = {
            flightNumber: doc['flight_number'],
            mission: doc['name'],
            rocket: doc['rocket']['name'],
            launchDate: doc['date_local'],
            upcoming: doc['upcoming'],
            success: doc['success'],
            customers
        }

        await saveLaunch(launch);
    }

}

// Get the launches data from SpaceX API
async function loadLaunchesData() {
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat'
    });

    if(firstLaunch) {
        console.log('Launch Data already loaded');
    } else {
        await populateLaunches();
    }
}

async function findLaunch(filter) {
    return await launches.findOne(filter);
}

async function launchExists(launchId) {
    // Instead of using ObjectId, flightNumber is being used as identifier
    return await findLaunch({
        flightNumber: launchId
    });
}

async function getAllLaunches(skip, limit) {
    return await launches
        .find({}, { '__v': 0, '_id': 0 })
        .sort({
            flightNumber: 1
        })
        .skip(skip)
        .limit(limit);
}

async function getLatestFlightNumber() {
    const latestLaunch = await launches
        .findOne({})
        .sort('-flightNumber');

    if(!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER;
    }

    return latestLaunch.flightNumber;
}   

async function saveLaunch(launch) {
    await launches.findOneAndUpdate({
        flightNumber: launch.flightNumber
    }, launch, {
        upsert: true
    });
}

async function scheduleNewLaunch(launch) {
    const planet = await planets.findOne({
        keplerName: launch.destination
    });

    if(!planet) {
        throw new Error('No valid destination found.');
    }

    const newFlightNumber = await getLatestFlightNumber() + 1;
    const customers = setRandomCustomers();

    const newLaunch = Object.assign(launch, {
        flightNumber: newFlightNumber,
        customers,
        success: true,
        upcoming: true
    });

    await saveLaunch(newLaunch);
}

async function abortLaunchById(id) {
    const aborted = await launches.updateOne({
        flightNumber: id
    }, {
        success: false,
        upcoming: false
    });

    // If the document has been modified return true otherwise false
    return aborted.modifiedCount === 1;
}

module.exports = {
    loadLaunchesData,
    getAllLaunches,
    scheduleNewLaunch,
    launchExists,
    abortLaunchById
}