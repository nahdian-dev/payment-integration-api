const Joi = require('joi');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
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

    // ==== SEND EMAIL VERIFICATION CODE ====
    function sendEmailVerification(email, verificationCode) {
        try {
            nodemailer.createTestAccount((err, account) => {
                if (err) {
                    res.status(300).send('Failed to create a testing account.');
                };

                const transporter = nodemailer.createTransport({
                    host: account.smtp.host,
                    port: account.smtp.port,
                    secure: account.smtp.secure,
                    auth: {
                        user: account.user,
                        pass: account.pass,
                    },
                });

                const mailMessage = {
                    from: account.smtp.host,
                    to: email,
                    subject: 'Email Verification',
                    text: `Your verification code is: ${verificationCode}`,
                };

                transporter.sendMail(mailMessage, (err, info) => {
                    if (err) {
                        res.status(300).send('Fail to send email verification');
                    }

                    console.log('- Preview URL: ' + nodemailer.getTestMessageUrl(info));
                });
            });

        } catch (error) {
            console.log(`- Error ouccured: ${error} `);
        };
    };

    function checkEmailResult(result) {
        if (result === 1) {
            const sqlGetIsVerified = `SELECT isVerified FROM users WHERE email = '${value.email}'`;

            createConnection.query(sqlGetIsVerified, (error, results, fields) => {
                if (error) {
                    res.send(error);
                }

                const isVerified = results[0].isVerified;

                const generateLength = Math.floor(Math.random() * 10000);
                const verificationCode = generateLength.toString().padStart(4, '0');

                if (isVerified === 0) {
                    const sqlUpdateVerificationCode = `UPDATE users SET verificationCode = ${verificationCode} WHERE email = '${value.email}'`;

                    createConnection.query(sqlUpdateVerificationCode, (error) => {
                        if (error) {
                            res.send(error);
                        }

                        res.status(200).json({
                            message: 'Update verification code!',
                            accepted: value.email
                        });
                    });
                }

                if (isVerified === 1) {
                    res.status(400).send('Email is already exists!');
                }
            });
        };

        if (result > 1) {
            res.status(400).send('Email is duplicate!');
        };

        if (result === 0) {
            const generateLength = Math.floor(Math.random() * 10000);
            const verificationCode = generateLength.toString().padStart(4, '0');

            sendEmailVerification(value.email, verificationCode);

            // ==== HASH PASSWORD ====
            const hashPassword = bcrypt.hashSync(value.password, 10);

            // ==== POST DATA =====
            const sqlPostData = `INSERT INTO users(username, email, password, isVerified, verificationCode) values('${value.username}','${value.email}','${hashPassword}', '0', ${verificationCode})`;
            createConnection.query(sqlPostData, (error, result, query) => {
                if (error) {
                    res.status(400);
                    throw new Error(`Error when upload data to db: ${error}`);
                };

                res.status(200).json({
                    message: 'Register success!',
                    accepted: value.email
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

// @desc Verification Email
// @route POST - /users/register/email-verification
// @access public
exports.registerEmailVerification = (req, res) => {


};


// @desc
// @route
// @access
exports.userLogin = (req, res) => { };