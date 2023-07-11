const Joi = require('joi');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
require('dotenv').config();
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

    // ==== INSTANCE DB ====
    const createConnection = connection.createConnection();

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

    // ==== POST TO DB ====
    function postDataToDB(emailAvailability) {
        // IS AVAILABLE
        if (emailAvailability === 1) {
            const sqlGetIsVerified = `SELECT isVerified FROM users WHERE email = '${value.email}'`;

            createConnection.query(sqlGetIsVerified, (error, results, fields) => {
                if (error) {
                    res.send(error);
                }

                const isVerified = results[0].isVerified;

                const generateLength = Math.floor(Math.random() * 10000);
                const verificationCode = generateLength.toString().padStart(4, '0');

                if (isVerified === 0) {
                    sendEmailVerification(value.email, verificationCode);

                    const sqlUpdateVerificationCode = `UPDATE users SET verificationCode = ${verificationCode} WHERE email = '${value.email}'`;

                    createConnection.query(sqlUpdateVerificationCode, (error) => {
                        if (error) {
                            res.send(error);
                        }

                        res.status(200).json({
                            message: 'Update verification code!',
                            verificationCode: verificationCode,
                            accepted: value.email
                        });
                    });
                }

                if (isVerified === 1) {
                    res.status(400).send('Email is already exists!');
                }
            });
        };

        // IS DUPLICATED
        if (emailAvailability > 1) {
            res.status(400).send('Email is duplicate!');
        };

        // IS NOT AVAILABLE
        if (emailAvailability === 0) {
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
                    message: 'Register success, please verify the code was sent to your email!',
                    verificationCode: verificationCode,
                    accepted: value.email
                });
            });

            createConnection.end();
        };
    }

    const sqlCheckEmail = `SELECT email FROM users WHERE email = '${value.email}'`;

    createConnection.query(sqlCheckEmail, (error, result, query) => {
        if (error) throw new Error('Failed to check email!');

        const emailAvailability = Object.entries(result).length;
        postDataToDB(emailAvailability);
    });
};

// @desc Verification Email
// @route POST - /users/register/email-verification
// @access public
exports.emailVerification = (req, res) => {
    const requestSent = req.body;
    const createConnection = connection.createConnection();

    // ==== GET VERIFICATION CODE ====
    const sqlGetVerificationCode = `SELECT verificationCode FROM users WHERE email = '${requestSent.email}'`;

    createConnection.query(sqlGetVerificationCode, (error, results, fields) => {
        if (error) {
            res.send(error);
        }

        const verificationCode = results[0].verificationCode;

        // ==== COMPARE VERIFICATION CODE ====
        const sqlGetIsVerified = `SELECT isVerified FROM users WHERE email = '${requestSent.email}'`;

        createConnection.query(sqlGetIsVerified, (error, results, fields) => {
            if (error) {
                res.send(error);
            }

            const isVerified = results[0].isVerified;

            // NOT VERIFIED
            if (isVerified === 0) {
                if (verificationCode === requestSent.verificationCode) {
                    const sqlUpdateIsVerified = `UPDATE users SET isVerified = '1' WHERE email = '${requestSent.email}'`;

                    createConnection.query(sqlUpdateIsVerified, (error) => {
                        if (error) {
                            res.send(error);
                        }

                        res.status(200).json({
                            message: 'Verification Success!'
                        });
                    });
                }

                if (verificationCode !== requestSent.verificationCode) {
                    res.status(400).send('Failed to verify account, verification code was different!');
                }
            }

            // IS VERIFIED
            if (isVerified === 1) {
                res.status(400).send('Failed to verify account, account has been verified!');
            }
        });

    });
};

// @desc Login Account
// @route GET - /users/login
// @access public
exports.userLogin = (req, res) => {
    // ==== VALIDATE BODY ====
    const validateReqBody = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    });

    const { error, value } = validateReqBody.validate(req.body);

    if (error) {
        res.status(400);
        throw new Error(`Error when validate body: ${error}`);
    }

    // ==== INSTANCE DB ====
    const createConnection = connection.createConnection();

    // ==== GET DATA FROM DB ====
    const sqlGetEmailAndPass = `SELECT email, password, isVerified FROM users WHERE email = '${value.email}'`;

    createConnection.query(sqlGetEmailAndPass, (error, results, fields) => {
        if (error) {
            res.status(400).send('Failed to login!');
        }

        const emailAvailability = Object.entries(results).length;

        if (emailAvailability === 0) {
            res.status(403).send('Unregistered Email!');
        }

        if (emailAvailability === 1) {
            const resultEmail = results[0].email;
            const resultPassword = results[0].password;
            const resultIsVerified = results[0].isVerified;

            if (resultIsVerified === 0) {
                res.status(403).send('Email has not been verify, please verify account!');
            }

            if (resultIsVerified === 1) {
                bcrypt.compare(value.password, resultPassword, (err, result) => {
                    if (err) {
                        console.error(err);
                    }

                    if (!result) {
                        res.status(400).send(`Password do not match!`);
                    }

                    if (result) {
                        const payload = {
                            email: value.email
                        };

                        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

                        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decode) => {
                            if (err) {
                                console.error(err);
                            }

                            res.status(200).json({
                                message: 'Login succesfully!',
                                email: value.email,
                                expiredIn: decode.exp,
                                token: token
                            });
                        });
                    }
                });
            }
        }
    });

};