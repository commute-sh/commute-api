const express = require('express');
const app = express();
const requestLogger = require('./lib/requestLogger');
const path = require('path');

app.use(requestLogger());

app.get('/vls/v1/stations', (req, res) => {

    if (req.query.contract === 'Paris') {
        res.sendFile(path.join(__dirname, 'data/stations.json'));
    } else {
        res.status(400).json({
            message: `Contract name not recognized (${req.query.contract})`
        });
    }
});

app.listen(8080, () => {
    console.log('JCDecaux API Mock listening on port 8080!');
});