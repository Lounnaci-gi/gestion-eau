const express = require("express");
const router = express.Router();
const { authenticate, authorize ,emailValidation} = require('../controllers/validator');
const {add_structure,liste_structure,get_structure,update_structure}=require('../controllers/structurecontroller');


//Routes ajouter structure
router.post('/add_structure', emailValidation, add_structure);

//Routes pour afficher la liste des structure
router.get('/liste_structure',liste_structure);

//Routes pour récupérer la structure par son ID
router.get('/liste_structure/:id',get_structure);

//Routes pour mise a jour de la structure 
router.put('/liste_structure/:id',emailValidation,update_structure);

module.exports = router;