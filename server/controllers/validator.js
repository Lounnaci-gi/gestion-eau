const { body } = require("express-validator");

const validation= [
    body("nomComplet").notEmpty().withMessage("Le nom complet est obligatoire."),
    body("nomUtilisateur").notEmpty().withMessage("Le nom d'utilisateur est obligatoire."),
    body("email").isEmail().withMessage("L'email est invalide."),
    body("motDePasse")
        .isLength({ min: 8 }).withMessage("Le mot de passe doit contenir au moins 8 caractères.")
        .matches(/[A-Z]/).withMessage("Le mot de passe doit contenir au moins une majuscule.")
        .matches(/[a-z]/).withMessage("Le mot de passe doit contenir au moins une minuscule.")
        .matches(/\d/).withMessage("Le mot de passe doit contenir au moins un chiffre.")
        .matches(/[@$!%*?&]/).withMessage("Le mot de passe doit contenir au moins un caractère spécial (@$!%*?&)."),
];

module.exports= validation;