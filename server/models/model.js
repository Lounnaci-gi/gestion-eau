const mongoose = require("mongoose");

// Schéma pour les clients
const clientSchema = mongoose.Schema(
    {
        Id_Dossier: {
            type: String,
            required: false,
            unique: false,
        },
        Civilite: {
            type: String,
            required: true,
        },
        raison_sociale: {
            type: String,
            required: true,
        },
        Adresse_correspondante: {
            type: String,
            required: true,
        },
        Code_postale: {
            type: Number,
        },
        commune_correspondante: {
            type: String,
            required: true,
        },
        Num_pic_identite: {
            type: new mongoose.Schema({
                numero: { type: String, required: false },
                delivre_par: { type: String, required: false },
                date_delivrance: { type: Date, required: false },
            }),
            required: false
        },
        Adresse_branchement: {
            required: true,
            type: String,
        },
        commune_branchement: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: false,
        },
        telephone: {
            type: [String],
            required: false,
            default: []
        },

        type_client: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Schéma pour les structures
const structureSchema = new mongoose.Schema({
    raison_sociale: {
        type: String,
        required: true,
        unique: true
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Structure", // Référence à une autre structure (hiérarchie)
        default: null
    },
    prefixe: {
        type: String,
        required: true,
        unique: true
    },
    telephone: {
        type: String,
        required: true
    },
    fax: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    },
    adresse: {
        type: String,
        required: true
    },
    compte_bancaire: {
        type: String,
        required: true
    },
    nom_compte_bancaire: {
        type: String,
        required: true
    },
    compte_postal: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Schéma pour les utilisateurs avec référence à la structure
const userSchema = mongoose.Schema(
    {
        nomComplet: {
            type: String,
            required: true
        },
        nomUtilisateur: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        motDePasse: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ["admin", "chef_centre", "chef_agence", "chef_tech_com", "juriste", "utilisateur", "chef_sect_client"],
            default: "utilisateur"
        },
        // Ajout de la référence à la structure
        structure: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Structure",
            required: false
        },
        tokenVersion: {
            type: Number,
            default: 0
        },
        resetToken: {
            type: String,
            default: null
        },
        resetTokenExpire: {
            type: Date,
            default: null
        },
        // Ajout du statut de l'utilisateur
        statut: {
            type: String,
            enum: ["actif", "inactif"],
            default: "actif"
        }
    },
    { timestamps: true }
);

// Schéma pour les articles
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
    caracteristiques: {
        type: Map,
        of: String
    }
}, {
    timestamps: true
});

// Création des modèles
const Client = mongoose.model("Client", clientSchema);
const User = mongoose.model("User", userSchema);
const Article = mongoose.model("Article", articleSchema);
const Structure = mongoose.model("Structure", structureSchema);


// Export des modèles
module.exports = { Client, User, Article, Structure };