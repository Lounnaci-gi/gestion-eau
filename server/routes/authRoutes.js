const express = require("express");
const router = express.Router();
const { validation, loginLimiter, authenticate, authorize } = require('../controllers/validator');
const { login, new_user, forgot_password, resetPassword, check_auth, logout, liste_utilisateur,
        delete_user,get_user,update_user,getStructures } = require('../controllers/authController');


// Route pour la connexion
router.post('/login', loginLimiter, login);

// Route pour créer un nouvel utilisateur
router.post('/user', validation, new_user);

// Route pour la récupération de mot de passe
router.post('/forgot-password', forgot_password);

// Route pour la réinitialisation de mot de passe
router.post('/reset-password/:token', resetPassword);

//Route pour vérifier l'authentification
router.get('/check-auth', check_auth);

// Route pour la déconnexion
router.post('/logout', logout);

// Route pour la liste des utilisateurs
router.get('/liste', authenticate, authorize(["admin","chef_centre"]), liste_utilisateur);

// Route pour supprimer utilisateur
router.delete('/liste/:id', authenticate, authorize(["admin"]), delete_user);

// Récupérer un utilisateur par ID
router.get('/liste/:id',authenticate, get_user);

// Route pour mettre a jour l'utilisateur
router.put('/liste/:id',authenticate,authorize(["admin","chef_centre"]), update_user);

// Dans votre fichier de routes
router.get('/structures', getStructures);

module.exports = router;