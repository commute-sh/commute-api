const express = require('express');
const app = express();
const stationService = require('./lib/stationService');
const requestLogger = require('./lib/requestLogger');
const moment = require('moment');
const responseTime = require('response-time')

app.use(requestLogger());
app.use(responseTime());

app.get('/stations', function (req, res) {

    const start = moment();

    const contractName = req.query['contract-name'] || 'Paris';
    const numbers = req.query.numbers ? req.query.numbers.split(',') : [];

    if (!contractName) {
        res.status(400).json({ message: 'Query Param `contract-name` is mandatory' });
        return ;
    }

    ( numbers.length === 0 ?
        stationService.findByContractName(contractName) :
        stationService.findByNumbers(contractName, numbers)
    ).then((stations) => {
        res.status(200).json(stations);

        const duration = moment.duration(moment().diff(start)).milliseconds();

        console.log("*** Station provided in", duration, "ms");

    }).catch((err) => {
        console.log('[ERROR]', err.message, ' - stack:', err.stack);
        res.status(500).json({ message: err.message });
    });

});

app.get('/stations/nearby', function (req, res) {
    const start = moment();

    const contractName = req.query['contract-name'] || 'Paris';
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const distance = Number(req.query.distance || '5000');

    stationService.nearby(contractName, lat, lng, distance).then((stations) => {
        res.status(200).json(stations);

        const duration = moment.duration(moment().diff(start)).milliseconds();

        console.log("*** Station provided in", duration, "ms");

    }).catch((err) => {
        console.log('[ERROR]', err.message, ' - stack:', err.stack);
        res.status(500).json({ message: err.message });
    });

});


const stationAvailability = function (req, res) {
    const start = moment();

    const contractName = req.params.contractName;
    const date = req.params.date ? moment(req.params.date, 'YYYYMMDD-HHmm') : moment().subtract(1, 'days');
    const stationNumber = Number(req.params.stationNumber);

    stationService.fetchInfluxDbDataByDateAndStationNumber(contractName, date, stationNumber, 60).then((stations) => {
        res.status(200).json(stations);

        const duration = moment.duration(moment().diff(start)).milliseconds();

        console.log("*** Station provided in", duration, "ms");

    }).catch((err) => {
        console.log('[ERROR]', err.message, ' - stack:', err.stack);
        res.status(500).json({ message: err.message });
    });

}

app.get('/stations/:contractName/:stationNumber/availability/:date', stationAvailability);
app.get('/stations/:contractName/:stationNumber/availability', stationAvailability);
app.get('/stations/:contractName/:stationNumber/:date/data', stationAvailability);

var httpPort = process.env.HTTP_PORT || 3000;

app.listen(httpPort, function () {
    console.log(`Commute API listening on port ${httpPort} !`);
});