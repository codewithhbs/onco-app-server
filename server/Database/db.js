const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

async function getDbConnection() {
    if (!pool) {
        pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });

        console.log('MySQL pool created');

        // Optional: Check initial connection
        try {
            const connection = await pool.getConnection();
            console.log('Connected to the database');
            connection.release();
        } catch (error) {
            console.error('Database connection error:', error);
        }
    }

    return pool;
}

module.exports = getDbConnection;