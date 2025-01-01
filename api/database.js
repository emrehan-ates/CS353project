const {Pool} = require('pg');

const config = {
    user: 'postgres',
    host: 'localhost',
    database: 'sarisite',
    password: 'sarisite',
    port: 5432,
}

let pool;

function getPool() {
    if(pool) {
        console.log("DB already exists!");
    } else {
        console.log("Creating postgre pool");
        pool = new Pool(config);
    }
    return pool;
}

module.exports = getPool;

