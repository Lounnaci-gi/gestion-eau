const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");

const { login, new_user } = require('../controllers/authController');



// Route pour la connexion
router.post('/login', login);

// Route pour créer un nouveau utilisateur
router.post('/user',[
    body("nomComplet").notEmpty().withMessage("Le nom complet est obligatoire."),
    body("email").isEmail().withMessage("L'email est invalide."),
    body("motDePasse")
        .isLength({ min: 8 }).withMessage("Le mot de passe doit contenir au moins 8 caractères.")
        .matches(/[A-Z]/).withMessage("Le mot de passe doit contenir au moins une majuscule.")
        .matches(/[a-z]/).withMessage("Le mot de passe doit contenir au moins une minuscule.")
        .matches(/\d/).withMessage("Le mot de passe doit contenir au moins un chiffre.")
        .matches(/[@$!%*?&]/).withMessage("Le mot de passe doit contenir au moins un caractère spécial (@$!%*?&)."),
],new_user);


module.exports = router;