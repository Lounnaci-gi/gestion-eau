const express = require('express');
const app = express();
const port = 3000;
const path = require("path");
const connectdb = require("./config/db");
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const cookieParser = require('cookie-parser'); // Importez cookie-parser
// Connexion à MongoDB
connectdb();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Servir les fichiers statiques du dossier "client"
app.use(express.static(path.join(__dirname, '../client')));
// Utilisez cookie-parser comme middleware
app.use(cookieParser());

// Route par défaut : renvoyer "index.html"
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Importer les routes
app.use('/', require("./routes/authRoutes"));

// Démarrage du serveur
app.listen(port, () => {
    console.log(`Le serveur est lancé sur le port: http://localhost:${port}`);
});