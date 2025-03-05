const express = require('express');
const app = express();
const port = 3000;
const path = require("path");
const connectdb = require("./config/db");
require("dotenv").config();

// Connexion à MongoDB
connectdb();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Servir les fichiers statiques du dossier "client"
app.use(express.static(path.join(__dirname, '../client')));

// Route par défaut : renvoyer "index.html"
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});


// Démarrage du serveur
app.listen(port, () => {
    console.log(`Le serveur est lancé sur le port: http://localhost:${port}`);
});