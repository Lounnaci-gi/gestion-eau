const express = require("express");
const router = express.Router();
const { validation, loginLimiter } = require('../controllers/validator');
const { login, new_user, forgot_password, resetPassword } = require('../controllers/authController');
const jwt = require("jsonwebtoken");

// Route pour vérifier l'authentification
router.get('/check-auth', async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json({ authenticated: false });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId); // Récupérez l'utilisateur depuis la base de données
        if (!user) {
            return res.json({ authenticated: false });
        }
        res.json({ authenticated: true, user });
    } catch (error) {
        res.json({ authenticated: false });
    }
});

// Route pour la déconnexion
router.post('/logout', (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        expires: new Date(0), // Expire immédiatement
        path: '/',
    });
    res.status(200).json({ success: true, message: "Déconnexion réussie" });
});

// Route pour la connexion
router.post('/login', loginLimiter, login);

// Route pour créer un nouvel utilisateur
router.post('/user', validation, new_user);

// Route pour la récupération de mot de passe
router.post('/forgot-password', forgot_password);

// Route pour la réinitialisation de mot de passe
router.post('/reset-password/:token', resetPassword);

module.exports = router;