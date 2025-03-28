const { json } = require("express");
const { Client, User, Article, Structure } = require("../models/model");
const { validationResult } = require("express-validator");



// Ajouter nouvelle structure
module.exports.add_structure = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("Erreurs détectées :", errors.array());  // 🔹 Affiche bien les erreurs dans la console
        return res.status(400).json({ errors: errors.array() });  // ❌ STOP : Retourne l'erreur, ne continue pas
    }
    try {
        const data = { raison_sociale, prefixe, telephone, fax, email, adresse, compte_bancaire, nom_compte_bancaire, compte_postal } = req.body;

        const existingStructure = await Structure.findOne({
            $or: [
                { raison_sociale: raison_sociale },
                { prefixe: prefixe }
            ]
        });

        if (existingStructure) {
            if (existingStructure.raison_sociale === raison_sociale) {
                res.status(400);
                throw new Error(`La structure "${raison_sociale}" existe déjà.`);
            } else {
                res.status(400);
                throw new Error(`Le préfixe "${prefixe}" est déjà utilisé.`);
            }
        }

        const new_structure = await Structure.create({
            raison_sociale,
            prefixe,
            telephone,
            fax,
            email,
            adresse,
            compte_bancaire,
            nom_compte_bancaire,
            compte_postal
        });

        await new_structure.save();

        res.status(200).json({ success: true, message: "Structure ajouté avec succès.", data: new_structure });

    } catch (err) {
        next(err);

    }

}

// Afficher la liste des structures existante
module.exports.liste_structure = async (req, res, next) => {
    try {

        const structure = await Structure.find();
        if (structure.length === 0) { // Vérifier si le tableau est vide
            return res.status(404).json({ success: false, message: "Aucune structure trouvé." });
        }
        res.json({ success: true, data: structure });
    } catch (err) {
        next(err)
    }
}

// Route pour récupérer la structure par ID
module.exports.get_structure = async (req, res, next) => {
    try {
        const structureId = req.params.id;
        const structure = await Structure.findById(structureId);

        if (!structure) {
            return res.status(404).json({
                success: false,
                message: "Structure non trouvé"
            });
        }

        res.status(200).json({
            success: true,
            data: structure
        });
    } catch (error) {
        next(error);

    }

}

// Mettre à jour une structure
module.exports.update_structure = async (req, res) => {
    try {
        const structureId = req.params.id;
        const { raison_sociale, prefixe, telephone, fax, email, adresse, compte_bancaire, nom_compte_bancaire, compte_postal } = req.body;

        // Vérifier si l'email existe déjà pour un autre utilisateur
        const existingStructure = await Structure.findOne({ raison_sociale, _id: { $ne: structureId } });
        if (existingStructure) {
            return res.status(400).json({
                success: false,
                message: "Cette structure est déjà"
            });
        }

        // Trouver et mettre à jour l'utilisateur
        const updateStructure = await Structure.findByIdAndUpdate(
            structureId,
            { raison_sociale, prefixe, telephone, fax, email, adresse, compte_bancaire, nom_compte_bancaire, compte_postal },
            { new: true, runValidators: true }
        );

        if (!updateStructure) {
            return res.status(404).json({
                success: false,
                message: "Structure non trouvé"
            });
        }

        res.status(200).json({
            success: true,
            message: "Structure mis à jour avec succès",
            data: updateStructure
        });
    } catch (error) {
        console.error("Erreur mise a jour structure:", error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur"
        });
    }
};