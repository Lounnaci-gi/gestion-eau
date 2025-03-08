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
function updateLogin() {
    const logo = document.getElementsByClassName("company-name")[0];
    const token = sessionStorage.getItem("token");
    const user = JSON.parse(sessionStorage.getItem("user"));

    if (!logo) return;

    if (token && user) {
        setAuthButton("connected");
        logo.textContent = user.nomUtilisateur || "Utilisateur";
    } else {
        setAuthButton("disconnected");
        logo.textContent = "Logo";
    }
}

// ✅ Gestion du bouton connexion/déconnexion avec confirmation
authToggle.addEventListener("click", () => {
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
        }).then((result) => {
            if (result.isConfirmed) {
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("user");
                updateLogin();
                showAlert("Déconnecté", "Vous avez été déconnecté avec succès.", "success");
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
            resetForms();
        }
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

        if (!result.data || !result.data.email) {
            throw new Error("Données utilisateur invalides.");
        }

        // 🔥 Stocker les infos utilisateur
        sessionStorage.setItem("token", result.token);
        sessionStorage.setItem("user", JSON.stringify(result.data));

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

    // 🔥 Vérification de la sécurité du mot de passe
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        showAlert("Erreur", "Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial (@, $, !, %, *, ?, &).", "error");
        return;
    }

    if (!nomComplet || !utilisateur || !email || !password) {
        showAlert("Erreur", "Veuillez remplir tous les champs.", "warning");
        return;
    }

    Swal.fire({
        title: "Inscription en cours...",
        html: "Veuillez patienter...",
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });

    const data = { nomComplet, nomUtilisateur: utilisateur, email, motDePasse: password };

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

        Swal.close();
        showAlert("Succès", result.message, "success");

        // ✅ Après inscription, on affiche directement le formulaire de connexion
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

// 🔄 Mettre à jour au chargement de la page
document.addEventListener("DOMContentLoaded", updateLogin);
