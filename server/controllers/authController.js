const { Client, User, Article, Structure } = require("../models/model");
const { validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const { loginLimiter } = require("./validator");
const nodemailer = require("nodemailer");
const cookieParser = require('cookie-parser');


// Configuration du transporteur d'e-mails
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

//----Login------------------------------------
module.exports.login = async (req, res, next) => {
    try {
        const { email, motDePasse } = req.body;

        // Validation des entrées
        if (!email || !motDePasse) {
            res.status(400);
            throw new Error("Email et mot de passe sont requis.");
        }

        const user = await User.findOne({ email });
        if (!user) {
            res.status(401);
            throw new Error("Email ou mot de passe incorrect.");
        }

        const isPasswordValid = await bcrypt.compare(motDePasse, user.motDePasse);
        if (!isPasswordValid) {
            res.status(401);
            throw new Error("Email ou mot de passe incorrect.");
        }

        const token = jwt.sign(
            {
                userId: user._id,
                nomUtilisateur: user.nomUtilisateur,
                tokenVersion: user.tokenVersion // Ajoutez cette ligne
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 3600000,
            path: '/',
        });

        res.status(200).json({
            success: true,
            token,
            data: {
                nomUtilisateur: user.nomUtilisateur,
                email: user.email,
                nomComplet: user.nomComplet
            }
        });

        // Réinitialiser le compteur de loginLimiter en cas de connexion réussie
        loginLimiter.resetKey(req.ip);
    } catch (err) {
        next(err);
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
        const existingAdmin = await User.findOne({ role: "admin" });
        if (role === "admin") {
            if (existingAdmin) {
                return res.status(403).json({ message: "Un admin existe déjà." });
            }
            if (email !== process.env.ADMIN_EMAIL) {
                return res.status(403).json({ message: "Seul l'administrateur désigné peut créer un compte admin." });
            }
            if (secretCode !== process.env.ADMIN_SECRET) {
                return res.status(403).json({ message: "Code secret incorrect." });
            }
        }

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
};

//--Récupération mot de passe------------
module.exports.forgot_password = async (req, res) => {
    const { email } = req.body;

    // Vérifier si l'email est fourni
    if (!email) {
        return res.status(400).json({ success: false, message: "L'email est requis." });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "Utilisateur non trouvé." });
        }

        // 🔒 Générer un token et stocker sa version hachée
        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        user.resetToken = hashedToken; // ✅ Stocker la version hachée du token
        user.resetTokenExpire = Date.now() + 3600000; // Expire après 1h
        await user.save();

        // 📩 Envoyer le lien de réinitialisation par e-mail
        const resetLink = `http://localhost:3000/users/reset-password/${resetToken}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Réinitialisation du mot de passe",
            text: `Cliquez sur le lien suivant pour réinitialiser votre mot de passe : ${resetLink}`,
            html: `<p>Cliquez sur le lien suivant pour réinitialiser votre mot de passe : <a href="${resetLink}">${resetLink}</a></p>`,
        });

        // Stocker le token de réinitialisation dans un cookie HTTP-Only et Secure
        res.cookie("resetToken", resetToken, {
            httpOnly: true, // Empêche l'accès au cookie via JavaScript
            secure: process.env.NODE_ENV === "production", // Envoi uniquement sur HTTPS en production
            sameSite: "strict", // Protection contre les attaques CSRF
            maxAge: 3600000, // Durée de validité du cookie (1 heure)
        });

        res.json({
            success: true,
            message: `Un e-mail de réinitialisation a été envoyé à ${user.email}.`
        });

    } catch (err) {
        console.error("Erreur dans forgot_password :", err);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
};

//-----------Reset password------------------------------------------------------------------------
module.exports.resetPassword = async (req, res) => {
    const { token } = req.params; // Token envoyé dans l'URL
    const { newPassword } = req.body; // Nouveau mot de passe soumis
    const resetTokenFromCookie = req.cookies.resetToken; // Récupérer le token du cookie

    try {
        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({ success: false, message: "Le mot de passe doit contenir au moins 8 caractères." });
        }

        // Vérifier que le token de l'URL correspond au token du cookie
        if (token !== resetTokenFromCookie) {
            return res.status(400).json({ success: false, message: "Token de réinitialisation invalide." });
        }

        // 🔍 Hacher le token reçu pour le comparer avec la version stockée
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        // 📌 Vérifier si l'utilisateur existe avec ce token et qu'il n'a pas expiré
        const user = await User.findOne({
            resetToken: hashedToken,
            resetTokenExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Token invalide ou expiré." });
        }

        // 🔒 Hasher le nouveau mot de passe avant de l'enregistrer
        const salt = await bcrypt.genSalt(10);
        user.motDePasse = await bcrypt.hash(newPassword, salt);

        // 📌 Mettre à jour les informations utilisateur avant la sauvegarde
        user.tokenVersion = (user.tokenVersion || 0) + 1; // 🔥 Invalider les anciens JWT
        user.resetToken = undefined; // Supprimer le token de réinitialisation
        user.resetTokenExpire = undefined;
        await user.save();

        // 📩 Envoyer un e-mail de confirmation
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Votre mot de passe a été réinitialisé",
            text: "Bonjour,\n\nVotre mot de passe a été réinitialisé avec succès. Si vous n'êtes pas à l'origine de cette demande, veuillez contacter notre support immédiatement.\n\nCordialement,\nL'équipe de support",
            html: `<p>Bonjour,</p><p>Votre mot de passe a été réinitialisé avec succès. Si vous n'êtes pas à l'origine de cette demande, veuillez contacter notre support immédiatement.</p><p>Cordialement,<br>L'équipe de support</p>`,
        });

        // Supprimer le cookie de réinitialisation
        res.clearCookie("resetToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        // ✅ Répondre au frontend pour forcer la déconnexion
        res.json({
            success: true,
            message: "Mot de passe réinitialisé avec succès ! Vous devez vous reconnecter.",
            forceLogout: true,
        });

    } catch (err) {
        console.error("Erreur lors de la réinitialisation du mot de passe :", err);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
};

// Route pour vérifier l'authentification
module.exports.check_auth = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.json({ authenticated: false });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-motDePasse');

        if (!user || user.tokenVersion !== decoded.tokenVersion) {
            return res.json({ authenticated: false });
        }

        res.json({
            authenticated: true,
            user: {
                _id: user._id,
                nomUtilisateur: user.nomUtilisateur,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Erreur check_auth:", error);
        res.json({ authenticated: false });
    }
};

// Route pour la déconnexion
module.exports.logout = async (req, res) => {
    try {
        res.cookie('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(0),
            path: '/',
        });
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur serveur lors de la déconnexion"
        });
    }
};

//Route Liste des utilisateurs
// module.exports.liste_utilisateur = async (req, res) => {
//     try {
//         const users = await User.find({ role: { $ne: "admin" } }) // Exclure les admins
//             .select('-motDePasse')
//             .populate('structure') // Ajoutez cette ligne
//             .lean();

//         if (users.length === 0) { // Vérifier si le tableau est vide
//             return res.status(404).json({ success: false, message: "Aucun utilisateur trouvé." });
//         }

//         res.json({ success: true, data: users });
//     } catch (error) {
//         console.error("Erreur liste_utilisateur:", error);
//         res.status(500).json({
//             success: false,
//             message: "Erreur serveur. Contactez l'administrateur.",
//             error: process.env.NODE_ENV === "development" ? error.message : undefined
//         });
//     }
// };

// Route Liste des utilisateurs
module.exports.liste_utilisateur = async (req, res) => {
    try {
        // Récupérer l'utilisateur connecté (on suppose que vous avez un middleware d'authentification)
        const connectedUser = req.user; // Récupéré via middleware d'authentification
        
        let query = {};
        
        // Adapter la requête selon le rôle de l'utilisateur connecté
        if (connectedUser.role === "admin") {
            // L'admin voit tout le monde sauf les autres admins
            query = { role: { $ne: "admin" } };
        } else if (connectedUser.role === "chef_centre") {
            // Le chef de centre voit les utilisateurs de sa structure
            // OU les utilisateurs sans structure avec rôle "utilisateur"
            query = {
                $or: [
                    { structure: connectedUser.structure },
                    { $and: [
                        { structure: { $eq: null } },
                        { role: "utilisateur" }
                    ]}
                ]
            };
        } else {
            // Pour les autres rôles, retourner un accès refusé
            return res.status(403).json({ 
                success: false, 
                message: "Vous n'avez pas les droits nécessaires pour accéder à cette ressource." 
            });
        }
        
        // Exécuter la requête avec les filtres appropriés
        const users = await User.find(query)
            .select('-motDePasse')
            .populate('structure')
            .lean();
        
        if (users.length === 0) { // Vérifier si le tableau est vide
            return res.status(404).json({ success: false, message: "Aucun utilisateur trouvé." });
        }
        
        res.json({ success: true, data: users });
    } catch (error) {
        console.error("Erreur liste_utilisateur:", error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur. Contactez l'administrateur.",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};
// Récupérer un utilisateur par ID
module.exports.get_user = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId)
            .select('-motDePasse')
            .populate('structure'); 

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Utilisateur non trouvé"
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error("Erreur get_user:", error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur"
        });
    }
};

// Route pour supprimer utilisateur
module.exports.delete_user = async (req, res, next) => {
    try {
        const user = req.params;
        if (!user) {
            res.status(400);
            throw new Error("utilisateur requis.");
        }

        const response = await User.findByIdAndDelete(user.id);

        if (!response) {
            res.status(404);
            throw new Error("utilisateur non trouvé.");
        }

        res.json({ success: true, message: "Utilisateur supprimé avec succès" });

    } catch (err) {
        next(err)
    }
};

// Mettre à jour un utilisateur
module.exports.update_user = async (req, res) => {
    try {
        const userId = req.params.id;
        const { nomComplet, email, role, structure } = req.body;

        // Vérifier si l'email existe déjà pour un autre utilisateur
        const existingUser = await User.findOne({ email, _id: { $ne: userId } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Cet email est déjà utilisé par un autre utilisateur"
            });
        }

        // Préparer les données de mise à jour
        const updateData = {
            nomComplet,
            email,
            role
        };

        // Ajouter la structure seulement si elle est fournie
        if (structure) {
            updateData.structure = structure;
        } else {
            // Si structure est vide, la supprimer
            updateData.$unset = { structure: "" };
        }

        // Trouver et mettre à jour l'utilisateur
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-motDePasse').populate('structure');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "Utilisateur non trouvé"
            });
        }

        res.status(200).json({
            success: true,
            message: "Utilisateur mis à jour avec succès",
            data: updatedUser
        });
    } catch (error) {
        console.error("Erreur update_user:", error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur"
        });
    }
};

// Dans authController.js ou un nouveau contrôleur
module.exports.getStructures = async (req, res) => {
    try {
        const structures = await Structure.find().lean();
        res.json({ success: true, data: structures });
    } catch (error) {
        console.error("Erreur getStructures:", error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};