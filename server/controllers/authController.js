const { Client, User, Article } = require("../models/model");
const { validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("express-rate-limit");
// Importer le limiteur de requêtes
const { loginLimiter } = require("./validator");

//----Login------------------------------------
module.exports.login = async (req, res) => {
    try {
        const { email, motDePasse } = req.body;
        const user = await User.findOne({ email });


        if (!user) {
            return res.status(401).json({ success: false, message: "email d'utilisateur ou mot de passe incorrect." });
        }

        // Comparer le mot de passe fourni avec le mot de passe hashé
        const isPasswordValid = await bcrypt.compare(motDePasse, user.motDePasse);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Nom d'utilisateur ou mot de passe incorrect." });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("❌ JWT_SECRET manquant ! Impossible de générer un token.");
        }
        

        const token = jwt.sign(
            { userId: user._id, nomUtilisateur: user.nomUtilisateur },
            process.env.JWT_SECRET, // 🔒 Utiliser uniquement la variable d'environnement
            { expiresIn: "1h" } // ⏳ Réduit la durée de validité à 1 heure
        );

        // Réinitialiser le compteur de tentatives pour cette IP
        loginLimiter.resetKey(req.ip);

        // ✅ Renvoyer le token et les infos utilisateur
        res.status(200).json({
            success: true, token, data: {
                nomUtilisateur: user.nomUtilisateur,
                email: user.email,
                nomComplet: user.nomComplet
            }
        });

    } catch (err) { // Ajoutez `err` ici
        console.error("Erreur de connexion:", err);
        res.status(500).json({ success: false, message: "Une erreur est survenue lors de la connexion." });
    }
};

//--Créer utilisateur---------------------
module.exports.new_user = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { nomComplet, nomUtilisateur, email, motDePasse, role, secretCode } = req.body;
    try {
        // Vérifier si l'utilisateur ou l'email existe déjà
        const existingUser = await User.findOne({ $or: [{ nomUtilisateur }, { email }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Le nom d'utilisateur ou l'email est déjà utilisé." });
        }
        // Hasher le mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(motDePasse, salt);

        // Créer un nouvel utilisateur avec un rôle défini
        const newUser = await User.create({
            nomComplet,
            nomUtilisateur,
            email,
            motDePasse: hashedPassword,
            role: role || "utilisateur" // 🔥 Par défaut, l’utilisateur a un accès limité
        });

        await newUser.save();
        res.status(200).json({ success: true, message: "Utilisateur ajouté avec succès.", data: newUser });

    } catch (err) {
        console.error("Erreur dans newuser :", err);
        res.status(500).json({ success: false, message: "Une erreur est survenue lors de la création de l'utilisateur." });
    }

}

//--nodemailer---------
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // Utilisez la variable d'environnement
        pass: process.env.EMAIL_PASSWORD, // Utilisez la variable d'environnement
    },
    tls: {
        rejectUnauthorized: false, // Ignore les erreurs SSL
    }
});
//--Récupération mot de passe------------

module.exports.forgot_password = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: `Utilisateur non trouvé.` });
        }

        // 🔒 Générer un token et stocker sa version hachée
        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        user.resetToken = hashedToken; // ✅ Stocker la version hachée du token
        user.resetTokenExpire = Date.now() + 3600000; // Expire après 1h
        await user.save();

        // 📩 Envoyer le token brut par email (car en base, on stocke uniquement la version hachée)
        const resetLink = `http://localhost:3000/users/reset-password/${resetToken}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Réinitialisation du mot de passe",
            text: `Cliquez sur le lien suivant pour réinitialiser votre mot de passe : ${resetLink}`,
        });

        res.json({
            message: `Un e-mail de réinitialisation a été envoyé à ${user.email}.`
        });

    } catch (err) {
        console.error("Erreur dans recupass :", err);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

//-----------Reset password------------------------------------------------------------------------
module.exports.resetPassword = async (req, res) => {
    const { token } = req.params; // Token envoyé dans l'URL
    const { newPassword } = req.body; // Nouveau mot de passe soumis

    try {
        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({ message: "Le mot de passe doit contenir au moins 8 caractères." });
        }

        // 🔍 Hacher le token reçu pour le comparer avec la version stockée
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        // 📌 Vérifier si l'utilisateur existe avec ce token et qu'il n'a pas expiré
        const user = await User.findOne({
            resetToken: hashedToken,
            resetTokenExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Token invalide ou expiré." });
        }

        // 🔒 Hasher le nouveau mot de passe avant de l'enregistrer
        const salt = await bcrypt.genSalt(10);
        user.motDePasse = await bcrypt.hash(newPassword, salt);

        // 📌 Mettre à jour les informations utilisateur avant la sauvegarde
        user.tokenVersion = (user.tokenVersion || 0) + 1; // 🔥 Invalider les anciens JWT
        user.resetToken = undefined; // Supprime le token de réinitialisation
        user.resetTokenExpire = undefined;
        await user.save(); // ✅ Un seul `save()`

        // 📩 Envoyer un email de confirmation
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Votre mot de passe a été réinitialisé",
            text: "Bonjour,\n\nVotre mot de passe a été réinitialisé avec succès. Si vous n'êtes pas à l'origine de cette demande, veuillez contacter notre support immédiatement.\n\nCordialement,\nL'équipe de support",
        });

        // ✅ Répondre au frontend pour forcer la déconnexion
        res.json({
            message: "Mot de passe réinitialisé avec succès ! Vous devez vous reconnecter.",
            forceLogout: true
        });

    } catch (err) {
        console.error("Erreur lors de la réinitialisation du mot de passe :", err);
        res.status(500).json({ message: "Erreur serveur." });
    }
};