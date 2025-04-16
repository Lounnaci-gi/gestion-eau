const express = require("express");
const router = express.Router();
const { authenticate, authorize, emailValidation, phoneValidation } = require('../controllers/validator');
const { add_client } = require('../controllers/clientController');

//Routes ajouter client

// router.post('/add_client', emailValidation, phoneValidation, authenticate, authorize(["admin"]), add_client);
router.post('/add_client', add_client);



module.exports = router;