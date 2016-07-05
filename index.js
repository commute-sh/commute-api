const express = require('express');
const app = express();
const stationService = require('./lib/stationService');
const requestLogger = require('./lib/requestLogger');

app.use(requestLogger());

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.get('/stations/nearby', function (req, res) {

    const city = req.query.city;
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const distance = Number(req.query.distance || '5000');

    stationService.neaby(city, lat, lng, distance).then((stations) => {
        res.status(200).json(stations);
    }).catch((err) => {
        res.status(500).json({ message: err.message });
    });

});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});