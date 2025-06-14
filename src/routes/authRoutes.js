const express = require('express');
const router = express.Router();
const {
    login,
    register,
    verifyOtp,
    forgotPassword,
    verytOTP,
    resetPassword,
    changePassword,
} = require('../controllers/authController');
router.post('/login', login);
router.post('/register', register);
router.post('/verify', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verytOTP);
router.post('/reset-password', resetPassword);
router.post('/change-password', changePassword);
module.exports = router;
