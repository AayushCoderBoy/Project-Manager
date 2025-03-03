const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Use the single URL
    ssl: {
        rejectUnauthorized: false, // Required for Render's managed databases
    },
});

module.exports = pool;
