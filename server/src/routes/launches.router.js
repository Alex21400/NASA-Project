const express = require('express');
const { httpGetAllLaunches, httpCreateLaunch, httpAbortLaunch } = require('../controllers/launches.controller');

const launchesRouter = express.Router();

launchesRouter.get('/', httpGetAllLaunches);
launchesRouter.post('/', httpCreateLaunch);
launchesRouter.patch('/:id', httpAbortLaunch);

module.exports = launchesRouter;