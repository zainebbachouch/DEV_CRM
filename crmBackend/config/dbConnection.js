const mysql = require("mysql");
require("dotenv").config();
const { DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME, CHARSET } = process.env;
const connection = mysql.createConnection({

    host: DB_HOST,
    database: DB_NAME,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    charset: CHARSET
});

connection.connect(function (err) {
    if (err) throw err;
    console.log(DB_NAME + " database connect");
});
module.exports = connection;
