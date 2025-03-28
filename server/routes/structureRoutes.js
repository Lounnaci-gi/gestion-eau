const express = require("express");
const router = express.Router();
const { authenticate, authorize ,emailValidation} = require('../controllers/validator');
const {add_structure,liste_structure,get_strtucture}=require('../controllers/structurecontroller');


//Routes ajouter structure
router.post('/add_structure',emailValidation,authenticate, add_structure);

//Routes pour afficher la liste des structure
router.get('/liste_structure',liste_structure);

// Récupérer un structures par ID
router.get('/liste_structure/:id',get_strtucture);


module.exports = router;