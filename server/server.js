const express = require('express');
const app = express();
const port = 3000;
const path = require("path");
const connectdb = require("./config/db");
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const cookieParser = require('cookie-parser'); // Importez cookie-parser
const { title } = require('process');
const errorHandler = require("./middlewares/errorHandler");
const cors = require('cors');
app.use(cors());

// Connexion à MongoDB
connectdb();

app.set("view engine", "ejs"); // Ou "pug" si tu utilises Pug
app.set("views", path.join(__dirname, "views"));


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
app.use('/', require("./routes/structureRoutes"));
app.use('/', require("./routes/clientRoutes"));

app.use(errorHandler);

// Gestion des erreurs
app.get("*", (req, res, next) => {
    res.status(404).render("index"); // Correspond à "views/index.ejs"

});

// Démarrage du serveur
app.listen(port,'0.0.0.0', () => {
    console.log(`Le serveur est lancé sur le port: http://localhost:${port}`);
});