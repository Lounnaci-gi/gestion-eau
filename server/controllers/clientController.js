const { json } = require("express");
const { Client, User} = require("../models/model");
const { validationResult } = require("express-validator");

// Ajouter nouveau client

module.exports.add_client = async (req, res, next) => {
    console.log(req.body);
    const errors = validationResult(req);
    console.log(errors);

    // if (!errors.isEmpty()) {
    //     return res.status(400).json({ errors: errors.array() });  // ❌ STOP : Retourne l'erreur, ne continue pas
    // }
    // try {
    //     const data = { raison_sociale, type_client, nom, prenom, quartier, rue, commune_correspondante, Code_postale, Num_pic_identite, delivrePar, dateDelivrance, email, telephone, fax } = req.body;

    //     const existingClient = await Client.findOne({
    //         $or: [
    //             { raison_sociale: raison_sociale },
    //             { Num_pic_identite: Num_pic_identite }
    //         ]
    //     });

    //     if (existingClient) {
    //         if (existingClient.raison_sociale === raison_sociale) {
    //             res.status(400);
    //             throw new Error(`Le client "${raison_sociale}" existe déjà.`);
    //         } else {
    //             res.status(400);
    //             throw new Error(`Le numéro de pièce d'identité "${Num_pic_identite}" est déjà utilisé.`);
    //         }
    //     }

    //     const new_client = await Client.create({
    //         raison_sociale,
    //         type_client,
    //         nom,
    //         prenom,
    //         quartier,
    //         rue,
    //         commune_correspondante,
    //         Code_postale,
    //         Num_pic_identite,
    //         delivrePar,
    //         dateDelivrance,
    //         email,
    //         telephone,
    //         fax
    //     });

    //     await new_client.save();

    //     res.status(200).json({ success: true, message: "Client ajouté avec succès.", data: new_client });

    // } catch (err) {
    //     next(err);

    // }
};