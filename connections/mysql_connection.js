const mysql = require('mysql');
require('dotenv').config();

exports.createConnection = function () {
    const userPassword = process.env.SQL_USER_PASSWORD;

    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: userPassword,
        database: 'payment_integration_db'
    });

    return connection;
}

exports.mysqlConnetion = function () {
    const connection = exports.createConnection();

    connection.connect((err) => {
        if (err) {
            console.error(`- Failed to connect MySQL: ${err}`);
            return;
        }
        console.log('- Database is connected to: ' + connection.config.database);
    });
}