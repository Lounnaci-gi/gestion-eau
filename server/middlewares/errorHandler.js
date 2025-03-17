// middlewares/errorHandler.js

const errorHandler = (err, req, res, next) => {
    // Affichage de l'erreur dans la console pour le suivi
    console.error("\u26A0\uFE0F Erreur interceptée :", err);

    // Si aucun code d'erreur n'a été défini, on utilise 500 par défaut
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);

    res.json({
        success: false,
        message: err.message || "Erreur interne du serveur.",
        stack: process.env.NODE_ENV === "production" ? null : err.stack, // Ne pas exposer la stack en production
    });
};

module.exports = errorHandler;
