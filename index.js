
const app = require('express')();
const {Client} = require('pg');
const ConsistentHash = require('consistent-hash');
const hr = new ConsistentHash();

const password = "secretpassword";
const user = "admin";
const host = "localhost";
const database = "mydb";
const clients = {
    "5432": new Client({
        host: host,
        user: user,
        password: password,
        port: 5432,
        database: database
    }),
    "5433": new Client({
        host: host,
        user: user,
        password: password,
        port: 5434,
        database: database
    }),
    "5434": new Client({
        host: host,
        user: user,
        password: password,
        port: 5434,
        database: database
    })
};