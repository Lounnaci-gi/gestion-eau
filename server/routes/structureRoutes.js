const express = require("express");
const router = express.Router();
const { authenticate, authorize, emailValidation, phoneValidation } = require('../controllers/validator');
const { add_structure, liste_structure, get_structure, update_structure, delete_structure } = require('../controllers/structurecontroller');


//Routes ajouter structure
router.post('/add_structure', emailValidation, phoneValidation, authenticate, add_structure);

//Routes pour afficher la liste des structure
router.get('/liste_structure', authenticate, liste_structure);

//Routes pour récupérer la structure par son ID
router.get('/liste_structure/:id', authenticate, get_structure);

//Routes pour mise a jour de la structure 
router.put('/liste_structure/:id', emailValidation, phoneValidation, authenticate, update_structure);

//Routes pour supprimer une structure 
router.delete('/liste_structure/:id', authenticate, authorize(["admin"]), delete_structure);

module.exports = router;