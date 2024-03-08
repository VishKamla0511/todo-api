const mysql = require("mysql2");
require('dotenv').config(); 

const connection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
})

connection.connect(function (err) {
    if (err) throw err
    console.log("Database connected")
})

module.exports = connection;