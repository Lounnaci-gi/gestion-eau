const mongoose = require("mongoose");

// Schéma pour les clients
const clientSchema = mongoose.Schema(
    {
        Id_Dossier: {
            type: String,
            required: true,
            unique: true,
        },
        Civilite: {
            type: String,
            required: true,
        },
        raison_sociale: {
            type: String,
            required: true,
        },
        Adresse_correspondante: { // Modification du nom du champ
            type: String,
            required: true,
        },
        Code_postale: {
            type: Number,
        },
        commune_correspondante: { // Modification du nom du champ
            type: String,
            required: true,
        },
        Num_pic_identite: {
            type: new mongoose.Schema({
                numero: { type: String, required: false }, // Numéro PIC Identité
                delivre_par: { type: String, required: false }, // Autorité qui a délivré
                date_delivrance: { type: Date, required: false }, // Date de délivrance
            }),
            required: false
        },
        Adresse_branchement: { // Nouveau champ
            required: true,
            type: String,
        },
        commune_branchement: { // Modification du nom du champ
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: false,
        },
        telephone: {
            type: String,
            required: false,
        },
        type_client: {
            type: String,
            required: true,
        },
        // Ajoutez d'autres champs si nécessaire pour type_client
    },
    {
        timestamps: true, // Ajoute automatiquement les champs createdAt et updatedAt
    }
);


// Schéma pour les utilisateurs
const userSchema = mongoose.Schema(
    {
        nomComplet: { type: String, required: true },
        nomUtilisateur: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        motDePasse: { type: String, required: true },
        role: {
            type: String,
            enum: ["admin", "chef_centre", "chef_agence", "chef_tech_com", "juriste", "utilisateur"], // 🔥 6 rôles
            default: "utilisateur" // L'utilisateur de base a un accès limité
        },
        tokenVersion: { type: Number, default: 0 }, // Ajoutez cette ligne
        resetToken: { type: String, default: null },
        resetTokenExpire: { type: Date, default: null },
    },
    { timestamps: true }
);


//Schéma pour les articles

const articleSchema = mongoose.Schema({
    id_article: {
        type: String,
        unique: true,

    },
    designation: {
        type: String,
        required: true,
        trim: true
    },
    rubrique: {
        type: String,
        required: true,
        enum: ["terrassement", "canalisations", "pieces_speciales", "cautionnements", "autres"]
    },
    materiau: {
        type: String,
        enum: ["cuivre", "pvc", "per", "pehd", "multicouche", "galvanisé", "fonte", "inox", "laiton", "autre"]
    },
    prix: [
        {
            date_application: { type: Date, default: Date.now },
            prix_unitaire_ht: { type: Number, required: true, min: 0 },
            prix_fourniture: { type: Number, min: 0 },
            prix_pose: { type: Number, min: 0 }
        }
    ],
    // 🔥 Ajout des caractéristiques techniques
    caracteristiques: {
        type: Map, // Utilisation d'un Map pour stocker des paires clé-valeur dynamiques
        of: String // Les valeurs peuvent être des chaînes de caractères (ou d'autres types si nécessaire)
    }
}, {
    timestamps: true
});

//Schéma pour les Structure
const structureSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100,
        message: "Le nom doit contenir entre 2 et 100 caractères."
    },
    type: {
        type: String,
        enum: ["centre", "departement", "antenne"],
        required: true,
        message: "Le type doit être 'centre', 'departement' ou 'antenne'."
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Structure", // Référence à une autre structure (hiérarchie)
        default: null
    },
    prefixe: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: v => /^[A-Z]{2}$/.test(v),
            message: "Le préfixe doit être 2 lettres majuscules."
        }
    },
    telephone: {
        type: String,
        required: true,
        validate: {
            validator: v => /^\+?[0-9\s-]{8,15}$/.test(v),
            message: "Numéro de téléphone invalide. Format attendu : +212 522-123456."
        }
    },
    fax: {
        type: String,
        required: true,
        validate: {
            validator: v => /^\+?[0-9\s-]{8,15}$/.test(v),
            message: "Numéro de fax invalide. Format attendu : +212 522-123457."
        }
    },
    email: {
        type: String,
        required: true,
        match: [/.+@.+\..+/, "Adresse email invalide."]
    },
    adresse: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 200,
        message: "L'adresse doit contenir entre 5 et 200 caractères."
    },
    boite_postale: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 20,
        message: "La boîte postale doit contenir entre 3 et 20 caractères."
    },
    compte_bancaire: {
        type: String,
        required: true,
        validate: {
            validator: v => /^[A-Z]{2}[0-9]{2}[A-Z0-9]{10,30}$/.test(v), // Format IBAN
            message: "Format IBAN/RIB invalide. Exemple : MA64012345678901234567890."
        }
    },
    compte_postal: {
        type: String,
        required: true,
        validate: {
            validator: v => /^[0-9]{5}(-[0-9]{5})?$/.test(v), // Format 12345 ou 12345-67890
            message: "Format de compte postal invalide. Exemple : 12345 ou 12345-67890."
        }
    }
}, { timestamps: true });

// Création des modèles
const Client = mongoose.model("Client", clientSchema);
const User = mongoose.model("User", userSchema);
const Article = mongoose.model("Article", articleSchema);
const Structure = mongoose.model("Structure", structureSchema);


// Export des modèles
module.exports = { Client, User, Article, Structure };