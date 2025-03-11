// 🔔 Fonction d'alerte globale
function showAlert(title, text, icon) {
    return Swal.fire({
        title: title,
        text: text,
        icon: icon,
        confirmButtonText: "OK"
    });
}

let logoutTimer;

function resetTimer() {
    clearTimeout(logoutTimer);
    logoutTimer = setTimeout(() => {
        // Envoyer une requête au serveur pour déconnecter l'utilisateur
        fetch('/logout', {
            method: 'POST',
            credentials: 'include' // Inclure les cookies dans la requête
        })
        .then(response => {
            if (response.ok) {
                showAlert("Déconnexion", "Votre session a expiré pour inactivité.", "info").then(() => {
                    window.location.href = "index.html"; // Rediriger vers la page de connexion
                });
            } else {
                console.error('Erreur lors de la déconnexion');
            }
        })
        .catch(error => {
            console.error('Erreur réseau:', error);
        });
    }, 15 * 60 * 1000); // Déconnecter après 15 minutes d'inactivité
}

// 🔄 Réinitialiser le timer à chaque activité de l’utilisateur
document.addEventListener("mousemove", resetTimer);
document.addEventListener("keypress", resetTimer);
document.addEventListener("click", resetTimer);
document.addEventListener("scroll", resetTimer);

// Vérification de la connexion
document.addEventListener("DOMContentLoaded", () => {
    // Vérifier si l'utilisateur est déjà hors ligne au chargement
    if (!navigator.onLine) {
        showAlert("Problème de connexion", "Vous êtes hors ligne.", "error");
    }

    // Événements pour détecter les changements de connexion en temps réel
    window.addEventListener('offline', () => {
        showAlert("Problème de connexion", "Vous êtes hors ligne.", "error");
    });

    window.addEventListener('online', () => {
        showAlert("Connexion rétablie", "Vous êtes de nouveau en ligne.", "success");
    });
});