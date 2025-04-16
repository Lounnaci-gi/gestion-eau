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
// const API_BASE_URL = "https://m4tfftv0-3000.uks1.devtunnels.ms"; // Remplacer par l'URL réelle en prod
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

// Fonction réutilisable pour formater les numéros de téléphone
function formatPhoneInput(inputElement) {
    inputElement.addEventListener('input', function (e) {
        let input = e.target.value.replace(/\D/g, ''); // Supprimer tous les caractères non numériques
        let formattedInput = '';

        if (input.length > 0) {
            if (input.startsWith('02') || input.startsWith('03') || input.startsWith('04')) {
                // Format pour téléphone fixe : 025 77 66 13
                formattedInput += input.substring(0, 3); // Les 3 premiers chiffres
                if (input.length > 3) {
                    formattedInput += ' ' + input.substring(3, 5);
                }
                if (input.length > 5) {
                    formattedInput += ' ' + input.substring(5, 7);
                }
                if (input.length > 7) {
                    formattedInput += ' ' + input.substring(7, 9);
                }
            } else if (input.startsWith('05') || input.startsWith('06') || input.startsWith('07')) {
                // Format pour téléphone mobile : 0563 97 94 46
                formattedInput += input.substring(0, 4);
                if (input.length > 4) {
                    formattedInput += ' ' + input.substring(4, 6);
                }
                if (input.length > 6) {
                    formattedInput += ' ' + input.substring(6, 8);
                }
                if (input.length > 8) {
                    formattedInput += ' ' + input.substring(8, 10);
                }
            } else {
                // Si le numéro ne correspond à aucun des formats attendus
                formattedInput = input;
            }
        }

        e.target.value = formattedInput;
    });
}

// Fonction pour restreindre la saisie aux chiffres uniquement
function restrictToNumbers(inputElement) {
    inputElement.addEventListener('input', function (e) {
        e.target.value = e.target.value.replace(/\D/g, '');
    });
}
