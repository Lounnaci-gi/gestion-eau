// Sélection des éléments
const authToggle = document.getElementById("authToggle");
const authModal = document.getElementById("authModal");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authSwitches = document.querySelectorAll(".auth-switch span");
const closeAuth = document.querySelector(".close-auth");

// ✅ Fonction pour mettre à jour le bouton "Sign In" / "Sign Out"
function setAuthButton(state) {
    const authText = authToggle.querySelector("span");
    const authIcon = authToggle.querySelector("i");

    if (state === "connected") {
        authText.textContent = "Sign Out";
        authIcon.className = "fas fa-sign-out-alt";
    } else {
        authText.textContent = "Sign In";
        authIcon.className = "fas fa-sign-in-alt";
    }
}

// ✅ Mise à jour de l'affichage connexion/déconnexion
async function updateLogin() {
    const logo = document.getElementsByClassName("company-name")[0];

    if (!logo) {
        console.error("Logo element with class 'company-name' not found!");
        return;
    }

    try {
        // Envoyer une requête au serveur pour vérifier l'état de connexion
        const response = await fetch("http://localhost:3000/check-auth", {
            method: "GET",
            credentials: "include", // Inclure les cookies HTTP-Only
        });

        const result = await response.json();

        if (result.isAuthenticated) {
            setAuthButton("connected");
            logo.textContent = result.user.nomUtilisateur || "Utilisateur";
        } else {
            setAuthButton("disconnected");
            logo.textContent = "Logo";
        }
    } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
        setAuthButton("disconnected");
        logo.textContent = "Logo";
    }
}

// ✅ Gestion du bouton connexion/déconnexion avec confirmation
authToggle.addEventListener("click", async () => {
    const authText = authToggle.querySelector("span").textContent;

    if (authText === "Sign In") {
        authModal.classList.add("show");
        loginForm.classList.add("active");
        registerForm.classList.remove("active");
    } else {
        Swal.fire({
            title: "Déconnexion",
            text: "Êtes-vous sûr de vouloir vous déconnecter ?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Oui, me déconnecter",
            cancelButtonText: "Annuler",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Envoyer une requête au serveur pour déconnecter l'utilisateur
                    const response = await fetch("http://localhost:3000/logout", {
                        method: "POST",
                        credentials: "include", // Inclure les cookies HTTP-Only
                    });

                    if (response.ok) {
                        updateLogin();
                        showAlert("Déconnecté", "Vous avez été déconnecté avec succès.", "success");
                    } else {
                        throw new Error("Erreur lors de la déconnexion.");
                    }
                } catch (error) {
                    console.error("Erreur lors de la déconnexion:", error);
                    showAlert("Erreur", "Une erreur est survenue lors de la déconnexion.", "error");
                }
            }
        });
    }
});

// ✅ Fermeture du modal d'authentification
closeAuth.addEventListener("click", () => {
    authModal.classList.remove("show");
});

// ✅ Basculer entre connexion et inscription
authSwitches.forEach((link) => {
    link.addEventListener("click", () => {
        if (loginForm.classList.contains("active")) {
            loginForm.classList.remove("active");
            registerForm.classList.add("active");
        } else {
            registerForm.classList.remove("active");
            loginForm.classList.add("active");
        }
        resetForms(); // Réinitialiser les formulaires après basculement
    });
});

// ✅ Fonction pour réinitialiser les formulaires
function resetForms() {
    loginForm.reset();
    registerForm.reset();
}

// ✅ Gestion de la soumission du formulaire de connexion
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        showAlert("Erreur", "Veuillez remplir tous les champs.", "warning");
        return;
    }

    if (!navigator.onLine) {
        return showAlert("Problème de connexion", "Vous êtes hors ligne.", "error");
    }

    Swal.fire({
        title: "Connexion en cours...",
        html: "Veuillez patienter...",
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });

    const data = { email: email, motDePasse: password };

    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            credentials: "include", // Inclure les cookies HTTP-Only
        });

        const result = await response.json();
        resetForms(); // Réinitialisation des formulaires après soumission

        if (!response.ok) {
            showAlert("Erreur", result.message, "error");
            return;
        }

        if (!result.token) {
            throw new Error("Token non reçu, problème d'authentification.");
        }

        // ✅ Mettre à jour le bouton immédiatement
        updateLogin();

        // ✅ Fermer le formulaire après connexion
        authModal.classList.remove("show");

        Swal.close();
        showAlert("Succès", "Connexion réussie !", "success");
    } catch (error) {
        showAlert("Erreur", "Une erreur est survenue lors de la connexion.", "error");
    }
});

// ✅ Gestion de la soumission du formulaire d'inscription
registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nomComplet = document.getElementById("nomComplet").value.trim();
    const utilisateur = document.getElementById("Utilisateur").value.trim();
    const email = document.getElementById("email_ins").value.trim();
    const password = document.getElementById("password_ins").value.trim();
    const role = document.getElementById("role").value;

    // Vérification de la sécurité du mot de passe
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        showAlert("Erreur", "Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial (@, $, !, %, *, ?, &).", "error");
        return;
    }

    if (!nomComplet || !utilisateur || !email || !password) {
        showAlert("Erreur", "Veuillez remplir tous les champs.", "warning");
        return;
    }

    // Afficher un loader pendant l'inscription
    Swal.fire({
        title: "Inscription en cours...",
        html: "Veuillez patienter...",
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });

    const data = { nomComplet, nomUtilisateur: utilisateur, email, motDePasse: password, role, secretCode };

    try {
        const response = await fetch("http://localhost:3000/user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        resetForms(); // Réinitialisation des formulaires après soumission

        if (!response.ok) {
            const errorMessage = result.errors
                ? result.errors.map((err) => `• ${err.msg}`).join("\n")
                : result.message || "Erreur lors de l'inscription.";
            showAlert("Erreur", errorMessage, "error");
            return;
        }

        // Afficher un message de succès
        Swal.close();
        showAlert("Succès", "Inscription réussie !", "success");

        // Après inscription, on affiche directement le formulaire de connexion
        registerForm.classList.remove("active");
        loginForm.classList.add("active");
    } catch (err) {
        showAlert("Erreur", `Une erreur s'est produite : ${err.message}`, "error");
    }
});

// ✅ Fonction pour afficher une alerte
function showAlert(title, text, icon) {
    return Swal.fire({
        title,
        text,
        icon,
        confirmButtonText: "OK",
    });
}

// Gestion du lien "Mot de passe oublié"
document.getElementById("forgotPasswordLink").addEventListener("click", (e) => {
    e.preventDefault();
    // Fermer le modal de connexion
    document.getElementById("authModal").classList.remove("show");
    // Ouvrir le modal de récupération de mot de passe
    document.getElementById("forgotPasswordModal").style.display = "flex";
});

// Gestion de la fermeture du modal de récupération de mot de passe
document.querySelector("#forgotPasswordModal .close-auth").addEventListener("click", () => {
    document.getElementById("forgotPasswordModal").style.display = "none";
});

// Gestion du retour à la connexion depuis le modal de récupération de mot de passe
document.querySelector("#forgotPasswordModal .auth-switch").addEventListener("click", () => {
    document.getElementById("forgotPasswordModal").style.display = "none";
    document.getElementById("authModal").classList.add("show");
    loginForm.classList.add("active"); // Afficher le formulaire de connexion
    registerForm.classList.remove("active"); // Masquer le formulaire d'inscription
});

// Gestion de la soumission du formulaire de récupération de mot de passe
document.getElementById("forgotPasswordForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("forgotPasswordEmail").value.trim();

    if (!email) {
        showAlert("Erreur", "Veuillez entrer votre email.", "warning");
        return;
    }

    Swal.fire({
        title: "Envoi en cours...",
        html: "Veuillez patienter...",
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });

    try {
        const response = await fetch("http://localhost:3000/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        const result = await response.json();

        if (!response.ok) {
            showAlert("Erreur", result.message, "error");
            return;
        }

        Swal.close();
        showAlert("Succès", result.message, "success");

        // Fermer le modal de récupération de mot de passe
        document.getElementById("forgotPasswordModal").style.display = "none";
    } catch (error) {
        showAlert("Erreur", "Une erreur est survenue lors de l'envoi du lien de réinitialisation.", "error");
    }
});

let secretCode = null; // Variable globale pour stocker le code secret
const roleSelect = document.getElementById("role");
roleSelect.addEventListener("change", async () => {
    if (roleSelect.value === "admin") {
        const { value: enteredCode } = await Swal.fire({
            title: "Code secret requis",
            input: "password",
            inputLabel: "Entrez le code secret pour créer un compte admin",
            inputPlaceholder: "Code secret",
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) {
                    return "Le code secret est requis !";
                }
            },
        });
        if (enteredCode) {
            secretCode = enteredCode; // Stocker le code secret dans la variable globale
        } else {
            roleSelect.value = "utilisateur"; // Réinitialiser le rôle si l'utilisateur annule
            secretCode = null; // Réinitialiser le code secret
        }
    } else {
        secretCode = null;
    }
});

// 🔄 Mettre à jour au chargement de la page
document.addEventListener("DOMContentLoaded", updateLogin);

// Gestion du timer d'inactivité
let logoutTimer1;

function resetTimer() {
    // ✅ Vérifier si le cookie "token" existe encore avant d'afficher l'alerte
    const token = document.cookie.split("; ").find(row => row.startsWith("token="));
    if (!token) {
        return; // ⛔ Stopper l'exécution ici si le token n'existe pas
    }

    clearTimeout(logoutTimer1); // Réinitialiser le timer existant
    logoutTimer1 = setTimeout(() => {
        // Supprimer les cookies
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httpOnly; secure; sameSite=strict";
        document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httpOnly; secure; sameSite=strict";

        // Afficher une alerte et rediriger vers la page de connexion
        showAlert("Déconnexion", "Votre session a expiré pour inactivité.", "info").then(() => {
            window.location.href = "index.html"; // 🔄 Redirige immédiatement vers la page de connexion
        });
    }, 15 * 60 * 1000); // ⏳ Déconnecte après 15 minutes d'inactivité
}

// Réinitialiser le timer lors des interactions utilisateur
document.addEventListener("click", resetTimer);
document.addEventListener("keypress", resetTimer);