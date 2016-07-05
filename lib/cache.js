
var Promise = require('bluebird');
var redis = require('redis');
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

var client;

exports.create = function() {

    if (client) {
       return client;
    }
    
    client = redis.createClient({
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || '6379',
        retry_strategy: function (options) {
            if (options.error.code === 'ECONNREFUSED') {
                // End reconnecting on a specific error and flush all commands with a individual error
                return new Error('The server refused the connection');
            }
            if (options.total_retry_time > 1000 * 60 * 60) {
                // End reconnecting after a specific timeout and flush all commands with a individual error
                return new Error('Retry time exhausted');
            }
            if (options.times_connected > 10) {
                // End reconnecting with built in error
                return undefined;
            }
            // reconnect after
            return Math.max(options.attempt * 100, 3000);
        }
    });

    client.on("error", function (err) {
        rconsole.error("Error " + err);
    });

    return client;

};