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

    return geo.nearbyAsync({ latitude: lat, longitude: lng }, distance).then((ids) => {
        const keys = ids.map(id => `${contract_name}_${id}`);
        console.log('[INFO] keys   :', keys);
        return cache.mgetAsync(keys).then((stations) => {
            return Promise.map(stations, () => stations.map(JSON.parse), { concurrency: 4 });
        });
    });
    
};
