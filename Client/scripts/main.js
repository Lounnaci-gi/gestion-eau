// Sélection des éléments
const authToggle = document.getElementById("authToggle");
const authModal = document.getElementById("authModal");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const forgotPasswordModal = document.getElementById("forgotPasswordModal");
const editUserModal = document.getElementById("editUserModal");
const authSwitches = document.querySelectorAll(".auth-switch span");
const closeAuthButtons = document.querySelectorAll(".close-auth");
const userTableModal = document.getElementById("userTableModal");

// Ajouter un gestionnaire d'événement à chaque bouton de fermeture
closeAuthButtons.forEach(closeBtn => {
    closeBtn.addEventListener("click", () => {
        // Fermer tous les modaux
        authModal.classList.remove("show");
        forgotPasswordModal.classList.remove("show");
        editUserModal.classList.remove("show");
        userTableModal.classList.remove("show");
    });
});
// Gestion du lien "Mot de passe oublié"
document.getElementById("forgotPasswordLink").addEventListener("click", (e) => {
    e.preventDefault(); // Empêcher le comportement par défaut du lien
    // Masquer complètement le modal d'authentification
    authModal.classList.remove("show");
    // Afficher le modal de récupération de mot de passe
    forgotPasswordModal.classList.add("show");
});



// Masquer le model de mots de passe oublier
document.querySelector("#forgotPasswordModal .auth-switch span").addEventListener("click", function() {
    // Masquer le modal de mot de passe oublié
    forgotPasswordModal.classList.remove("show");
    
    // Afficher le modal d'authentification
    authModal.classList.add("show");
    
    // Forcer l'affichage du formulaire de connexion
    loginForm.classList.add("active");
    loginForm.style.display = "block"; // ⚠️ Ajoutez cette ligne
    registerForm.classList.remove("active");
    registerForm.style.display = "none"; // ⚠️ Ajoutez cette ligne
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
        editUserModal.style.display ="none";
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

// forgotPasswordModal.style.display='flex';
// Basculer entre connexion, inscription et récupération de mot de passe
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



// Gestion du clic sur "Général"
document.getElementById("Utilisateurs").addEventListener("click", async (e) => {
    e.preventDefault();
    try {
        const response = await fetch("http://localhost:3000/liste", {
            method: "GET",
            credentials: "include"
        });

        // Ajouter cette vérification pour les erreurs d'authentification
        if (response.status === 401 || response.status === 403) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Veuillez vous connecter pour accéder à cette fonctionnalité");
        }

        if (!response.ok) throw new Error("Erreur de chargement des utilisateurs");

        const data = await response.json();
        console.log(data); // Pour déboguer

        // Accédez à data.data pour obtenir le tableau des utilisateurs
        if (data.success && Array.isArray(data.data)) {
            populateUserTable(data.data); // Utilisez data.data
        } else {
            throw new Error("Format de données invalide");
        }

        userTableModal.classList.add("show");

    } catch (error) {
        showAlert("Erreur", error.message, "error");
    }
});

// Remplir le tableau des utilisateurs
function populateUserTable(users) {
    if (!Array.isArray(users)) {
        console.error("Expected an array of users, got:", users);
        return;
    }

    userTableBody.innerHTML = users.map(user => `
        <tr>
            <td>${user.nomComplet || "Non renseigné"}</td>
            <td>${user.email || "Non renseigné"}</td>
            <td>${user.role || "Non renseigné"}</td>
            <td class="action-buttons">
                <button class="edit-btn" onclick="editUser('${user._id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="deleteUser('${user._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join("");
}

// Exemple de fonction de suppression
async function deleteUser(userId) {
    try {
        const result = await Swal.fire({
            title: 'Confirmer la suppression',
            text: "Cette action est irréversible !",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Oui, supprimer!'
        });

        if (result.isConfirmed) {
            const response = await fetch(`http://localhost:3000/liste/${userId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {   
                const data = await response.json();             
                throw new Error(data.message || "Échec de la suppression");
            } 

            showAlert("Succès", "Utilisateur supprimé avec succès", "success");
            document.getElementById("Utilisateurs").click(); // Recharger le tableau
        }
    } catch (error) {
        showAlert("Erreur", error.message, "error");
    }
}


// Modifier la fonction editUser
function editUser(userId) {
    try {
        // Afficher un loader pendant le chargement des données
        Swal.fire({
            title: "Chargement des données...",
            html: "Veuillez patienter...",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        // Récupérer les détails de l'utilisateur
        fetch(`http://localhost:3000/liste/${userId}`, {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) throw new Error("Échec de la récupération des données");
            return response.json();
        })
        .then(data => {
            Swal.close();
            
            // Remplir le formulaire avec les données de l'utilisateur
            document.getElementById('editUserId').value = userId;
            document.getElementById('editNomComplet').value = data.data.nomComplet;
            document.getElementById('editEmail').value = data.data.email;
            document.getElementById('editRole').value = data.data.role;
            
            // Afficher le modal d'édition
            document.getElementById('editUserModal').classList.add('show');
        })
        .catch(error => {
            Swal.close();
            showAlert("Erreur", error.message, "error");
        });
    } catch (error) {
        showAlert("Erreur", "Une erreur est survenue", "error");
    }
}

// Gérer la soumission du formulaire d'édition
document.getElementById("editUserForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const userId = document.getElementById('editUserId').value;
    const nomComplet = document.getElementById('editNomComplet').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const role = document.getElementById('editRole').value;
    
    // Validation
    if (!nomComplet || !email) {
        return showAlert("Erreur", "Veuillez remplir tous les champs requis", "warning");
    }
    
    // Afficher le loader
    Swal.fire({
        title: "Mise à jour en cours...",
        html: "Veuillez patienter...",
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });
    
    try {
        const response = await fetch(`http://localhost:3000/liste/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nomComplet, email, role }),
            credentials: 'include'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Erreur lors de la mise à jour");
        }
        
        Swal.close();
        showAlert("Succès", "Utilisateur mis à jour avec succès", "success");
        
        // Fermer le modal et rafraîchir la liste
        document.getElementById('editUserModal').classList.remove('show');
        document.getElementById("Utilisateurs").click();
    } catch (error) {
        Swal.close();
        showAlert("Erreur", error.message, "error");
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
document.addEventListener("DOMContentLoaded", () => updateLogin());
