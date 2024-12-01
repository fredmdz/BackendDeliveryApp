const mysql = require('mysql');
import {
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_USER,
  DB_PORT
} from './config.js'

const db = mysql.createConnection({
    user: DB_USER,
    password: DB_PASSWORD,
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME
});

db.connect(function(err) {
    if (err) throw err;
    console.log("DATABASE CONNECTED");
});

module.exports = db;