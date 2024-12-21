const mysql = require('mysql');

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'root123',
    database: process.env.DB_NAME || 'crm_db',
});

connection.connect((err) => {
    if (err) {
        console.error('Database connection error:', err);
        throw err;
    }
    console.log('Connected to MySQL Database:', process.env.DB_NAME || 'crm_db');
});

module.exports = connection;
