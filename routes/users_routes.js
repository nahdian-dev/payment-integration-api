const router = require('express').Router();
const usersControllers = require('../controllers/users_controllers');

router.get('/login', usersControllers.userLogin);

module.exports = router;