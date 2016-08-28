var Knex = require('knex');

var knex;

exports.create = function() {

    if (knex) {
       return knex
    }

    knex = Knex({
        client: 'mysql',
        connection: {
            host: process.env.DB_HOST || '127.0.0.1',
            port: process.env.DB_PORT || '3306',
            user: process.env.DB_USER || 'commute',
            password: process.env.DB_PASSWORD || 'commute',
            database: process.env.DB_DATABASE || 'commute'
        }
    });

    return knex;

};