const express = require("express");
const router = express.Router();
// const { body } = require("express-validator");
const { authenticate, validation, loginLimiter } = require('../controllers/validator');

const { login, new_user, forgot_password, resetPassword } = require('../controllers/authController');



// Route pour la connexion
router.post('/login', loginLimiter, login);

// Route pour créer un nouveau utilisateur
router.post('/user', validation, new_user);

// Route pour récupération de mot de passe
router.post('/forgot-password', forgot_password);
router.post("/reset-password/:token", resetPassword);

module.exports = router;