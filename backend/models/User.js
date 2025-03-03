const pool = require("../config/db");
const bcrypt = require("bcryptjs");

// Create users table if not exists
const createUserTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS accounts (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    await pool.query(query);
};
createUserTable();

// Signup function
const createUser = async (name, email, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = "INSERT INTO accounts (name, email, password) VALUES ($1, $2, $3) RETURNING *";
    const values = [name, email, hashedPassword];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// Find user by email
const getUserByEmail = async (email) => {
    const query = "SELECT * FROM accounts WHERE email = $1";
    const result = await pool.query(query, [email]);
    return result.rows[0];
};

module.exports = { createUser, getUserByEmail };
