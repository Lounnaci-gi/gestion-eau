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

// Fonction pour restreindre la saisie des dates uniquement
function formatDateInput(inputElement) {
    inputElement.addEventListener('input', function () {
        let value = this.value.replace(/[^0-9]/g, ''); // Supprime tout caractère non numérique
        let formattedValue = '';

        // Gestion du jour
        if (value.length >= 1) {
            let jour = value.substring(0, Math.min(2, value.length));
            // Si on a saisi 2 chiffres et qu'ils dépassent 31
            if (jour.length === 2 && parseInt(jour) > 31) {
                jour = '31'; // Limite à 31
            } else if (jour.length === 2 && parseInt(jour) === 0) {
                jour = '01'; // Minimum à 01
            }
            formattedValue += jour;

            // Ajout automatique du séparateur après le jour
            if (jour.length === 2 && value.length > 2) {
                formattedValue += '/';
            }
        }

        // Gestion du mois
        if (value.length > 2) {
            let mois = value.substring(2, Math.min(4, value.length));
            // Si on a saisi 2 chiffres pour le mois et qu'ils dépassent 12
            if (mois.length === 2 && parseInt(mois) > 12) {
                mois = '12'; // Limite à 12
            } else if (mois.length === 2 && parseInt(mois) === 0) {
                mois = '01'; // Minimum à 01
            }

            // Si le jour a déjà 2 chiffres
            if (formattedValue.length === 2) {
                formattedValue += '/';
            }
            formattedValue += mois;

            // Ajout automatique du séparateur après le mois
            if (mois.length === 2 && value.length > 4) {
                formattedValue += '/';
            }
        }

        // Gestion de l'année
        if (value.length > 4) {
            let annee = value.substring(4, Math.min(8, value.length));

            // Si le jour et le mois ont déjà 2 chiffres chacun
            if (formattedValue.length === 5) {
                formattedValue += '/';
            }
            formattedValue += annee;
        }

        this.value = formattedValue; // Met à jour le champ avec le bon format
    });

    // Vérification complète de la validité de la date après perte de focus
    inputElement.addEventListener('blur', function () {
        let parts = this.value.split('/');
        if (parts.length === 3) {
            let jour = parseInt(parts[0]);
            let mois = parseInt(parts[1]);
            let annee = parseInt(parts[2]);
            let anneeActuelle = new Date().getFullYear();

            // Vérification de l'année
            if (annee < 1900 || annee > anneeActuelle) {
                showAlert('Date invalide', 'l`année introduite ne peut pas dépasser l`année actuel.', 'error');
                annee = anneeActuelle; // Corrige l'année
            }

            // Vérification de la validité globale de la date
            const date = new Date(annee, mois - 1, jour);
            if (date.getFullYear() !== annee ||
                date.getMonth() !== mois - 1 ||
                date.getDate() !== jour) {
                // Date invalide, ajuster au dernier jour du mois
                const dernierJourDuMois = new Date(annee, mois, 0).getDate();
                jour = Math.min(jour, dernierJourDuMois);
            }

            // Formatage final avec padding
            this.value = `${jour.toString().padStart(2, '0')}/${mois.toString().padStart(2, '0')}/${annee}`;
        }
    });
}
