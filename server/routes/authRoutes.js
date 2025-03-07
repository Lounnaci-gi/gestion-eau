const express = require("express");
const router = express.Router();
// const { body } = require("express-validator");
const validation= require('../controllers/validator');

const { login, new_user } = require('../controllers/authController');



// Route pour la connexion
router.post('/login', login);

// Route pour créer un nouveau utilisateur
router.post('/user',validation,new_user);


module.exports = router;