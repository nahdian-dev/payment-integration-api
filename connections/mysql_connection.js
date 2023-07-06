const mysql = require('mysql');
require('dotenv').config();

exports.mysqlConnetion = function () {
    const userPassword = process.env.SQL_USER_PASSWORD;

    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: userPassword,
        database: 'payment_integration_db'
    });

    connection.connect((err) => {
        if (err) {
            console.error(`- Failed to connect MySQL: ${err}`);
            return;
        }

        console.log('- Database is connected to: ' + connection.config.database);
    });
}