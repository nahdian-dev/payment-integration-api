const router = require('express').Router();
const credit_card_controller = require('../controllers/credit_cards_controllers');

router.post('/add-credit-card', credit_card_controller.addCreditCard);

module.exports = router;