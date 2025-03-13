// Sélection des éléments
const authToggle = document.getElementById("authToggle");
const authModal = document.getElementById("authModal");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const forgotPasswordModal = document.getElementById("forgotPasswordModal");
const authSwitches = document.querySelectorAll(".auth-switch span");
const closeAuth = document.querySelector(".close-auth");

// Gestion du lien "Mot de passe oublié"
document.getElementById("forgotPasswordLink").addEventListener("click", (e) => {
    e.preventDefault(); // Empêcher le comportement par défaut du lien
    loginForm.classList.remove("active"); // Masquer le formulaire de connexion
    registerForm.classList.remove("active"); // Masquer le formulaire d'inscription
    forgotPasswordModal.style.display = "flex"; // Afficher le modal de récupération de mot de passe
});

// Gestion de la soumission du formulaire d'inscription
document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault(); // Empêcher le comportement par défaut du formulaire

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

    const data = { nomComplet, nomUtilisateur: utilisateur, email, motDePasse: password, role };

    try {
        const response = await fetch("http://localhost:3000/user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Erreur lors de l'inscription.");
        }

        const result = await response.json();
        Swal.close();
        showAlert("Succès", "Inscription réussie !", "success");

        // Réinitialiser les formulaires après soumission
        resetForms();

        // Afficher le formulaire de connexion après inscription
        registerForm.classList.remove("active");
        loginForm.classList.add("active");
    } catch (error) {
        showAlert("Erreur", error.message || "Une erreur s'est produite lors de l'inscription.", "error");
    }
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
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Erreur lors de l'envoi du lien de réinitialisation.");
        }

        const result = await response.json();
        Swal.close();
        showAlert("Succès", result.message, "success");

        // Fermer le modal de récupération de mot de passe
        forgotPasswordModal.style.display = "none";
        forgotPasswordModal.style.display = "none";
    } catch (error) {
        showAlert("Erreur", error.message || "Une erreur est survenue lors de l'envoi du lien de réinitialisation.", "error");
    }
});

// Mettre à jour le bouton "Sign In" / "Sign Out"
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

// Vérifier et mettre à jour l'état d'authentification
async function updateLogin() {
    const logo = document.getElementsByClassName("company-name")[0];

    try {
        const response = await fetch("http://localhost:3000/check-auth", {
            credentials: "include"
        });

        if (!response.ok) throw new Error("Erreur réseau");

        const data = await response.json();

        if (data.authenticated && data.user?.nomUtilisateur) {
            setAuthButton("connected");
            logo.textContent = data.user.nomUtilisateur;
        } else {
            setAuthButton("disconnected");
            logo.textContent = "Logo";
            document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }

    } catch (error) {
        console.error("Erreur de vérification :", error);
        setAuthButton("disconnected");
        logo.textContent = "Logo";
    }
}

// Gestion du bouton connexion/déconnexion avec confirmation
authToggle.addEventListener("click", async () => {
    const authText = authToggle.querySelector("span").textContent;

    if (authText === "Sign In") {
        // Afficher le modal de connexion
        authModal.classList.add("show");
        loginForm.classList.add("active");
        registerForm.classList.remove("active");
        forgotPasswordModal.style.display = "none"; // Masquer le modal de récupération de mot de passe
    } else {
        // Confirmation de déconnexion
        Swal.fire({
            title: "Déconnexion",
            text: "Êtes-vous sûr de vouloir vous déconnecter ?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Oui, me déconnecter",
            cancelButtonText: "Annuler",
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                try {
                    const response = await fetch('http://localhost:3000/logout', {
                        method: 'POST',
                        credentials: 'include'
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.message || "Échec de la déconnexion");
                    }

                    sessionStorage.clear();
                    updateLogin();
                    authModal.classList.remove("show");

                    return { success: true };
                } catch (error) {
                    Swal.showValidationMessage(
                        `Échec de la déconnexion: ${error.message}`
                    );
                    return { success: false };
                }
            }
        }).then((result) => {
            if (result.value?.success) {
                showAlert("Déconnecté", "Déconnexion réussie !", "success");
            }
        });
    }
});

// Fermeture du modal d'authentification
closeAuth.addEventListener("click", () => {
    authModal.classList.remove("show");
    forgotPasswordModal.style.display = "none"; // Masquer également le modal de récupération de mot de passe
});

// Basculer entre connexion, inscription et récupération de mot de passe
authSwitches.forEach((link) => {
    link.addEventListener("click", () => {
        if (loginForm.classList.contains("active")) {
            loginForm.classList.remove("active");
            registerForm.classList.add("active");
            forgotPasswordModal.style.display = "none"; // Masquer le modal de récupération de mot de passe
        } else {
            registerForm.classList.remove("active");
            loginForm.classList.add("active");
            forgotPasswordModal.style.display = "none"; // Masquer le modal de récupération de mot de passe
        }
        resetForms(); // Réinitialiser les formulaires après basculement
    });
});

// Réinitialiser les formulaires
function resetForms() {
    loginForm.reset();
    registerForm.reset();
    document.getElementById("forgotPasswordForm").reset();
}

// Gestion de la soumission du formulaire de connexion
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    resetForms();

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
            credentials: 'include', // Inclure les cookies
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Erreur lors de la connexion");
        }

        const result = await response.json();

        if (!result.token) {
            throw new Error("Token non reçu, problème d'authentification.");
        }

        if (!result.data || !result.data.nomUtilisateur) {
            throw new Error("Données utilisateur invalides.");
        }

        // Mettre à jour l'interface utilisateur
        updateLogin();

        // Fermer le modal de connexion
        authModal.classList.remove("show");

        Swal.close();
        showAlert("Succès", "Connexion réussie !", "success");
    } catch (error) {
        showAlert("Erreur", error.message || "Une erreur est survenue lors de la connexion.", "error");
    }
});

// Fonction pour afficher une alerte
function showAlert(title, text, icon) {
    return Swal.fire({
        title,
        text,
        icon,
        confirmButtonText: "OK",
    });
}

// Mettre à jour l'interface au chargement de la page
document.addEventListener("DOMContentLoaded", updateLogin());