const express = require("express");
const router = express.Router();
const { validation, loginLimiter, authenticate, authorize } = require('../controllers/validator');
const {add_structure}=require('../controllers/structurecontroller');

//Routes ajouter structure
router.post('/add_structure', add_structure);

module.exports = router;