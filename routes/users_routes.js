const router = require('express').Router();
const usersControllers = require('../controllers/users_controllers');

router.post('/register', usersControllers.userRegister);
router.post('/register/email-verification', usersControllers.emailVerification);

router.get('/login', usersControllers.userLogin);

module.exports = router;