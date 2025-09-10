const path = require("path")
require("dotenv").config({ path: path.resolve(__dirname, ".env")});

const { Pool } = require("pg");
// require("dotenv").config();
console.log("DB_USER:",process.env.DB_USER);
console.log("DB_PASSWORD:",process.env.DB_PASSWORD);

const pool = new Pool({
  user: process.env.DB_USER,   // your PostgreSQL username
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE, // database name (we'll create it later)
  password: process.env.DB_PASSWORD,   // your PostgreSQL password
  port: process.env.DB_PORT,
});

module.exports = pool;
