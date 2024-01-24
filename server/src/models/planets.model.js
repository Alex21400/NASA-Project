const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');

const planets = require('./planets.mongo');

function isHabitablePlanet(planet) {
    return planet['koi_disposition'] === 'CONFIRMED' &&
        planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11 &&
        planet['koi_prad'] < 1.6;
}

function loadPlanetsData() {
    return new Promise((resolve, reject) => {
        fs.createReadStream(path.join(__dirname, '..', 'data', 'kepler_data.csv'))
            .pipe(parse({
                comment: '#',
                columns: true
            }))
            .on('data', async (data) => {
                if(isHabitablePlanet(data)) {
                    await savePlanet(data);
                }
            })
            .on('error', error => {
                console.log(error);
                reject(error);
            })
            .on('end', async () => {
                resolve();
                
                const planetsFound = (await getAllPlanets()).length
                console.log(`${planetsFound} Habitable planets found!`);
            })
    });
}

async function getAllPlanets() {
    return await planets.find({});
}

// Upsert = insert + update
// Upsert means an update that inserts a new document if no documents matches the filter
async function savePlanet(data) {
    try {
        await planets.updateOne({
            keplerName: data.kepler_name
        }, {
            keplerName: data.kepler_name
        }, {
            upsert: true
        });
    } catch(error) {
        console.error(`Could not save planet. Error: ${error}`);
    }
}

module.exports = {
    loadPlanetsData,
    getAllPlanets
}