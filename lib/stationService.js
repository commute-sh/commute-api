'use strict';

const _ = require('lodash');
const Cache = require('../lib/cache');
const geoRedis = require('georedis');
const Promise = require('bluebird');

const db = require('../lib/db');
const moment = require('moment');

var influx = require('influx');

var client = Promise.promisifyAll(influx({
    host : process.env.DB_HOST || 'localhost',
    port : process.env.DB_PORT || 8086, // optional, default 8086
    protocol : process.env.DB_PROTOCOL || 'http', // optional, default 'http'
    username : process.env.DB_USER || 'commute',
    password : process.env.DB_PASSWORD || 'commute',
    database : process.env.DB_DATABASE || 'commute'
}));

exports.findByNumbers = function(contractName, stationNumbers) {

    const cache = Cache.create();

    console.log(`[INFO] Searching stations numbers: ${stationNumbers} and contract name: ${contractName}`);

    if (!stationNumbers || stationNumbers.length === 0) {
        return [];
    }

    const keys = stationNumbers.map(stationNumber => `${contractName}_${stationNumber}`);
    console.log('keys:', keys);

    return cache.mgetAsync(keys)
        .then(_.flatten)
        .map(JSON.parse)
        .tap(console.log)
        .map((station) => {
            return station;
        });

};

exports.findByContractName = function(contractName) {

    const cache = Cache.create();

    console.log(`[INFO] Searching stations by contract name: ${contractName}`);

    return cache.keysAsync(`${contractName}_*`).then(keys => {
        console.log('keys:', keys);
        return cache.mgetAsync(keys.filter(key => key !== `${contractName}_images`))
            .then(_.flatten)
            .map(JSON.parse)
            .tap(console.log)
            .map(station => station);
    });
};


/** AWS Lambda event handler */
exports.nearby = function(contractName, lat, lng, distance) {
    const start = moment();

    const cache = Cache.create();
    console.log("*** Cache.create():", moment.duration(moment().diff(start)).milliseconds(), "ms");
    const Geo = geoRedis.initialize(cache);
    console.log("*** geoRedis.initialize(cache):", moment.duration(moment().diff(start)).milliseconds(), "ms");

    const geo = Promise.promisifyAll(Geo.addSet('stations'));
    console.log("*** promisifyAll(Geo.addSet('stations'):", moment.duration(moment().diff(start)).milliseconds(), "ms");

    console.log(`[INFO] Searching stations nearby [lat: ${lat}, lng: ${lng}, distance: ${distance}, contract: ${contractName}]`);

    return geo.nearbyAsync({ latitude: lat, longitude: lng }, distance, { withDistances: true, order: true, accurate: true })
        .then((entries) => {

            console.log("*** Geo Nearby async:", moment.duration(moment().diff(start)).milliseconds(), "ms");

            const keys = entries.map(entry => `${contractName}_${entry.key}`);

            if (entries.length === 0) {
                return [];
            }

            return cache.mgetAsync(keys)
                .then((results) => {
                    console.log("*** cache.mgetAsync:", moment.duration(moment().diff(start)).milliseconds(), "ms");
                    return results;
                })
                .then(_.flatten)
                .then((results) => {
                    console.log("*** _.flatten:", moment.duration(moment().diff(start)).milliseconds(), "ms");
                    return results;
                })
                .map(JSON.parse)
                .then((results) => {
                    console.log("*** JSON.parse:", moment.duration(moment().diff(start)).milliseconds(), "ms");
                    return results;
                })
                .then ((results) => {

                    const stations = _.fromPairs(_.map(entries, i => [i.key, i]));
                    console.log("*** _.fromPairs:", moment.duration(moment().diff(start)).milliseconds(), "ms");

                    const resultsMapped = results
                        .map((station) => {
                            station.distance = (stations[station.number] || {}).distance;
                            return station;
                        });

                    console.log("*** map.station:", moment.duration(moment().diff(start)).milliseconds(), "ms");

                    return resultsMapped;
                })
                ;
        });
    
};

exports.fetchInfluxDbDataByDateAndStationNumber = function(contractName, date, stationNumber, every = 1) {

    const dateFormatted = moment(date).add(1, 'day').format('YYYY-MM-DD HH:mm') + ':00';
    const query = `SELECT * FROM ${contractName}_${stationNumber} WHERE time >= '${dateFormatted}' - 24h AND time < '${dateFormatted}'`;

    console.log('query:', query);

    return client.queryAsync(
        'commute',
        query
    ).then(data => {

        if (!every) {
            return data;
        }

        return _(data[0])
            .map((value, index) => {
                return index % every === 0 ? value : undefined;
            })
            .filter(value => value !== undefined)
            .values();
    });
};


// exports.fetchMySqlDataByDateAndStationNumber = function(contractName, date, stationNumber) {
//
//     const knex = db.create();
//
//     let offset = 0;
//
//     return knex()
//         .select('available_bike_stands', 'available_bikes', 'timestamp')
//         .from('stations_ts')
//         //        .where('contract_name', '=', contract_name)
//         .where('number', '=', stationNumber)
//         .andWhere('timestamp', '>=', moment(date).subtract(1, 'day').format('YYYY-MM-DD HH:mm'))
//         .andWhere('timestamp', '<', date.format('YYYY-MM-DD HH:mm'))
//         .orderBy('timestamp', 'asc').then(stations => {
//             return stations.map(station => {
//                 station.offset = offset;
//                 offset++;
//
//                 return station;
//             })
//         })
//         ;
// };