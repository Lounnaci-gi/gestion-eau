const { Client, User, Article, Structure } = require("../models/model");
const { validationResult } = require("express-validator");


// Ajouter nouvelle structure
module.exports.add_structure = async (req, res, next) => {
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