const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

// define the routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// define the routes for 2FA
router.post('/setup-2fa', userController.setup2FA);
router.post('/verify-2fa-setup', userController.verify2FA);
router.post('/verify-otp', userController.verifyOTP);

module.exports = router;