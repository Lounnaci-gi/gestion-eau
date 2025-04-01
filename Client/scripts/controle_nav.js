// 🔔 Fonction d'alerte globale
function showAlert(title, text, icon) {
    return Swal.fire({
        title: title,
        text: text,
        icon: icon,
        confirmButtonText: "OK"
    });
}

const API_BASE_URL = "http://localhost:3000"; // Remplacer par l'URL réelle en prod
let logoutTimer;

// Fonction pour réinitialiser le timer
function resetTimer() {
    clearTimeout(logoutTimer);
    logoutTimer = setTimeout(() => {
        fetch(`${API_BASE_URL}/logout`, {
            method: 'POST',
            credentials: 'include'
        })
            .then(response => {
                if (response.ok) {
                    showAlert("Déconnexion", "Votre session a expiré pour inactivité.", "info").then(() => {
                        window.location.href = window.location.origin + "/index.html"; // Rediriger proprement
                    });
                } else {
                    showAlert("Erreur", "Échec de la déconnexion. Essayez à nouveau.", "error");
                }
            })
            .catch(error => {
                console.error('Erreur réseau:', error);
                showAlert("Erreur", "Impossible de se déconnecter. Vérifiez votre connexion.", "error");
            });
    }, 15 * 60 * 1000); // 15 minutes
}

// 🔄 Réinitialisation automatique du timer au chargement et aux interactions
document.addEventListener("DOMContentLoaded", resetTimer);
document.addEventListener("mousemove", resetTimer);
document.addEventListener("keypress", resetTimer);
document.addEventListener("click", resetTimer);
document.addEventListener("scroll", resetTimer);

// Vérification de la connexion au chargement
document.addEventListener("DOMContentLoaded", () => {
    if (!navigator.onLine) {
        showAlert("Problème de connexion", "Vous êtes hors ligne.", "error");
    }
});
window.addEventListener('online', () => {
    showAlert("Connexion rétablie", "Vous êtes de nouveau en ligne.", "success");
});


document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    hamburger.addEventListener('click', function () {
        navLinks.classList.toggle('active');
    });
});


function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}