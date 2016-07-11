'use strict';

const _ = require('lodash');
const Cache = require('../lib/cache');
const geoRedis = require('georedis');
const Promise = require('bluebird');

/** AWS Lambda event handler */
exports.neaby = function(contract_name, lat, lng, distance) {

    const cache = Cache.create();
    const Geo = geoRedis.initialize(cache);

    var geo = Promise.promisifyAll(Geo.addSet('stations'));

    console.log(`[INFO] Searching stations nearby [lat: ${lat}, lng: ${lng}, distance: ${distance}, contract: ${contract_name}]`);

    return geo.nearbyAsync({ latitude: lat, longitude: lng }, distance, { withDistances: true, order: true, accurate: true }).then((entries) => {
        const keys = entries.map(entry => `${contract_name}_${entry.key}`);

        return cache.mgetAsync(keys)
            .then(_.flatten)
            .map(JSON.parse)
            .map((station) => {
                return Object.assign({}, station, {
                    distance: (_.find(entries, (entry) => {
                        return entry.key == station.number + 1
                    }) || {}).distance
                })
            });
    });
    
};
