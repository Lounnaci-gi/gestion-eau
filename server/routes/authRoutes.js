const express = require("express");
const router = express.Router();
const { validation, loginLimiter } = require('../controllers/validator'); // Supprimez `authenticate`
const { login, new_user, forgot_password, resetPassword } = require('../controllers/authController');

// Route pour la connexion
router.post('/login', loginLimiter, login);

// Route pour créer un nouvel utilisateur
router.post('/user', validation, new_user);

// Route pour la récupération de mot de passe
router.post('/forgot-password', forgot_password);

// Route pour la réinitialisation de mot de passe
router.post('/reset-password/:token', resetPassword); // Supprimez `authenticate`

module.exports = router;