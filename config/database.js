const sql = require('mssql');
require('dotenv').config();

// SQL Server configuration for D365 Retail Commerce
const config = {
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_DATABASE || 'AxDB',
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// Add authentication
if (process.env.DB_TRUSTED_CONNECTION === 'true') {
    config.authentication = {
        type: 'ntlm',
        options: {
            domain: process.env.DB_DOMAIN || '',
            userName: process.env.DB_USER || '',
            password: process.env.DB_PASSWORD || ''
        }
    };
} else {
    config.user = process.env.DB_USER;
    config.password = process.env.DB_PASSWORD;
}

let pool = null;

async function connect() {
    try {
        if (pool) return pool;
        pool = await sql.connect(config);
        console.log('Connected to D365 Retail Commerce database');
        return pool;
    } catch (err) {
        console.error('Database connection error:', err);
        throw err;
    }
}

async function close() {
    try {
        if (pool) {
            await pool.close();
            pool = null;
        }
    } catch (err) {
        console.error('Error closing database:', err);
    }
}

async function query(sqlQuery, params = {}) {
    try {
        const pool = await connect();
        const request = pool.request();
        for (const [key, value] of Object.entries(params)) {
            request.input(key, value);
        }
        const result = await request.query(sqlQuery);
        return result.recordset;
    } catch (err) {
        console.error('Query error:', err);
        throw err;
    }
}

module.exports = { connect, close, query, sql, config };
