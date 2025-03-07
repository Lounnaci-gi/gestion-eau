const { Client, User, Article } = require("../models/model");
const { validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

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