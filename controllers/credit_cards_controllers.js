const jwt = require('jsonwebtoken');
const Joi = require('joi');
require('dotenv').config();
const connection = require('../connections/mysql_connection');

// @desc Post Credit Card
// @route POST - /api/credit-cards/add-credit-card
// @access private
exports.addCreditCard = (req, res) => {
    // ==== VALIDATION TOKEN ====
    const tokenHeader = req.headers.authorization;
    const token = tokenHeader.replace('Bearer ', '');

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!decoded) {
        res.status(403).send('Invalid token!');
    }

    // ==== VALIDATION BODY ====
    const schema = Joi.object({
        card_number: Joi.number().required(),
        expired: Joi.required(),
        security_code: Joi.string().required(),
        owner: Joi.string().required(),
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
        res.status(400).send(`Error when validate data: ${error}`);
    }

    // ==== INSTANCE DB ====
    const createConnection = connection.createConnection();

    // ==== ADD CREDIT CARD ====
    const sqlPostCard = `INSERT INTO cards(card_number,owner, expired, security_code) values('${value.card_number}','${value.owner}','${value.expired}','${value.security_code}')`;

    createConnection.query(sqlPostCard, (error) => {
        if (error) {
            console.error(error);
            res.status(400).send('Error when post credit cards!');
        }

        res.status(200).send('Upload success!');

    });

};