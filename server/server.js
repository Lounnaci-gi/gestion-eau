const express = require('express');
const app = express();
const port = 3000;
const path = require("path");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Démarrage du serveur
app.listen(port, () => {
    console.log(`Le serveur est lancé sur le port: http://localhost:${port}`);
});