const express = require('express');
const app = express();
const stationService = require('./lib/stationService');
const requestLogger = require('./lib/requestLogger');

app.use(requestLogger());

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

var httpPort = process.env.HTTP_PORT || 3000;

app.listen(httpPort, function () {
    console.log('Commute API listening on port 3000!');
});