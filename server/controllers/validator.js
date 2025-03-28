const { body } = require("express-validator");
const jwt = require("jsonwebtoken");
const { User } = require("../models/model");
const rateLimit = require("express-rate-limit");

const validation = [
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


const authenticate = async (req, res, next) => {
    // Récupérer le token depuis le cookie
    const token = req.cookies.token;
    // Vérifier si le token est présent
    if (!token) {
        return res.status(401).json({ message: "⛔ Accès refusé. Veuillez vous identifier" });
    }

    try {
        // Vérifier et décoder le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Trouver l'utilisateur associé au token
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: "⚠️ Utilisateur introuvable." });
        }

        // ✅ Vérifier si le token est toujours valide
        if (user.tokenVersion !== decoded.tokenVersion) {
            return res.status(401).json({ message: "⚠️ Session expirée. Veuillez vous reconnecter." });
        }

        // Ajouter l'utilisateur à l'objet `req` pour une utilisation ultérieure
        req.user = user;
        next();
    } catch (err) {
        console.error("❌ Erreur de vérification du token :", err);

        // Supprimer le cookie invalide
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        res.status(401).json({ message: "❗ Token invalide. Vous allez être déconnecté." });
    }
};

// 🔥 Limiteur de requêtes pour éviter les attaques de brute-force sur la réinitialisation de mot de passe
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // 3 tentatives
    handler: (req, res) => { // ⚠️ Utilisez "handler" pour formater la réponse
        res.status(429).json({
            success: false,
            message: "Trop de tentatives. Réessayez dans 15 minutes."
        });
    }
});

// ✅ Middleware d'autorisation (gestion des rôles)
const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "⚠️ Non authentifié. Connectez-vous d'abord." });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "⛔ Accès refusé. Permissions insuffisantes." });
        }

        next();
    };
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emailValidation = [
    body("email")
    .notEmpty().withMessage("Lemail est obligatoire.")
    .isEmail().withMessage("L'email est invalide.")
    .matches(emailRegex).withMessage("L'email est invalide."), 

    // Ajoutez d'autres validations ici si nécessaire
];

// const phoneRegexMobile = /^0[6-7]\d{3} \d{2} \d{2} \d{2}$/; // Format mobile : 0663 97 94 46

const phoneRegexFixe = /^0[2-4]\d{2} \d{2} \d{2} \d{2}$/;  // Ex: 025 77 66 13
const phoneRegexMobile = /^0[5-7]\d{2} \d{2} \d{2} \d{2}$/; // Ex: 0663 97 94 46

const phoneValidation = [
    body("telephone")
        .trim()
        .notEmpty().withMessage("Le numéro de téléphone est obligatoire.")
        .custom((value) => {
            if (!phoneRegexFixe.test(value) && !phoneRegexMobile.test(value)) {
                throw new Error("Le numéro de téléphone est invalide. Format attendu : 0563 97 94 46 ou 025 77 66 13.");
            }
            return true;
        })
];
module.exports = { validation, loginLimiter, authenticate, authorize,emailValidation,phoneValidation };