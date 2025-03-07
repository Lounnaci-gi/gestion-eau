const express = require("express");
const router = express.Router();

const { login, new_user } = require('../controllers/authController');



// Route pour la connexion
router.post('/login', login);

// Route pour créer un nouveau utilisateur
router.post('/user', new_user);


module.exports = router;