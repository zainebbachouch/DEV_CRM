const mysql = require('mysql');

// Always use the same database, `crm_db`
const database = process.env.DB_NAME || 'crm_db';

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'root123',
    database: database,
});

connection.connect((err) => {
    if (err) {
        console.error('Database connection error:', err);
        throw err;
    }
    console.log('Connected to MySQL Database:', database);
});

module.exports = connection;
