const request = require('supertest');
const app = require('../src/app');  

const { connectMongo, disconnectMongo } = require('../src/services/connectMongo');

describe('Launches API', () => {
    beforeAll(async () => {
        await connectMongo();
    });

    afterAll(async () => {
        await disconnectMongo();
    });

    describe('Test GET /launches', () => {
        test('should respond with 200 success', async () => {
            const response = await request(app)
                .get('/v1/launches')
                .expect('Content-Type', /json/)
                .expect(200);
        });
    });
    
    describe('Test POST /launches', () => { 
        const completeLaunchData = {
            mission: 'Kepler Exploration MFI-23',
            rocket: 'Kepler Explorer FBS',
            launchDate: new Date('February 12, 2028'),
            destination: 'Kepler-442 b',
        }
    
        const launchDataWithoutDate = {
            mission: 'Kepler Exploration MFI-23',
            rocket: 'Kepler Explorer FBS',
            destination: 'Kepler-442 b',
        }
    
        const launchDataWithInvalidDate = {
            mission: 'Kepler Exploration MFI-23',
            rocket: 'Kepler Explorer FBS',
            launchDate: 'test',
            destination: 'Kepler-442 b',
        }
    
        test('it should respond with 201 success', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(completeLaunchData)
                .expect('Content-Type', /json/)
                .expect(201);
    
            const requestDate = new Date(completeLaunchData.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();    
            
            expect(response.body).toMatchObject(launchDataWithoutDate);
            expect(responseDate).toEqual(requestDate);
        });
    
        test('it should catch missing required inputs with 400 bad request', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(launchDataWithoutDate)
                .expect('Content-Type', /json/)
                .expect(400);
    
            expect(response.body).toStrictEqual({ error: 'Missing required inputs' });
        });
    
        test('it should catch invalid date', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(launchDataWithInvalidDate)
                .expect('Content-Type', /json/)
                .expect(400);
    
            expect(response.body).toStrictEqual({ error: 'Invalid launch date' });
        });
    });
});