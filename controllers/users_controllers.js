const Joi = require('joi');
const bcrypt = require('bcrypt');
const connection = require('../connections/mysql_connection');

// @desc Account Register
// @route POST - /users/register
// @access public
exports.userRegister = (req, res) => {
    // ==== VALIDATE ====
    const validateReqBody = Joi.object({
        username: Joi.string().alphanum().min(3).max(30).required(),
        email: Joi.string().email().required(),
        password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{8,16}$')),
        repeat_password: Joi.ref('password'),
    });

    const { error, value } = validateReqBody.validate(req.body);

    if (error) {
        res.status(400);
        throw new Error(`Error when validate body: ${error}`);
    }

    // ==== CEK EMAIL IS ALREADY EXISTS ====
    const createConnection = connection.createConnection();
    const sqlCheckEmail = `SELECT email FROM users WHERE email = '${value.email}'`;

    function checkEmailResult(result) {
        if (result === 1) {
            res.status(400).send('Email is already exists!');
        };

        if (result > 1) {
            res.status(400).send('Email is duplicate!');
        };

        if (result === 0) {
            // ==== HASH PASSWORD ====
            const hashPassword = bcrypt.hashSync(value.password, 10);

            // ==== POST DATA =====
            const sqlPostData = `INSERT INTO users(username, email, password) values('${value.username}','${value.email}','${hashPassword}')`;
            createConnection.query(sqlPostData, (error, result, query) => {
                if (error) {
                    res.status(400);
                    throw new Error(`Error when upload data to db: ${error}`);
                }

                res.status(200).json({
                    message: 'Register success!',
                    value: result
                });
            });

            createConnection.end();
        };
    }

    createConnection.query(sqlCheckEmail, (error, result, query) => {
        if (error) throw new Error('Failed to check email already exists!');

        const rowDataPacket = Object.entries(result).length;
        checkEmailResult(rowDataPacket);
    });
};

// @desc
// @route
// @access
exports.userLogin = (req, res) => { };