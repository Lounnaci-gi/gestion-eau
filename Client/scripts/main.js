// Gestion de l'authentification
const authToggle = document.getElementById('authToggle');
const authModal = document.getElementById('authModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authSwitches = document.querySelectorAll('.auth-switch span');
const closeAuth = document.querySelector('.close-auth');

// Menu hamburger
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

// Toggle auth button
authToggle.addEventListener('click', () => {
    authToggle.classList.toggle('active');
    authModal.classList.add('show');
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();

    if (authToggle.classList.contains('active')) {
        authToggle.querySelector('span').textContent = "Sign Up";
        authToggle.querySelector('i').className = "fas fa-sign-out-alt";
    } else {
        authToggle.querySelector('span').textContent = "Sign In";
        authToggle.querySelector('i').className = "fas fa-sign-in-alt";
    }
});

// Menu hamburger
hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Gestion du modal d'authentification
closeAuth.addEventListener('click', () => {
    authModal.classList.remove('show');
});

window.addEventListener('click', (e) => {
    if (e.target === authModal) {
        authModal.classList.remove('show');
    }
});

// Basculer entre les formulaires
authSwitches.forEach(link => {
    link.addEventListener('click', () => {
        loginForm.classList.toggle('active');
        registerForm.classList.toggle('active');
    });
});

// Soumission des formulaires
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    authModal.classList.remove('show');
    // Ajouter logique de connexion
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    authModal.classList.remove('show');
    // Ajouter logique d'inscription
});

//--------------------login-----------------

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    // Vérification des champs vides
    if (!email || !password) {
        showAlert('Erreur', 'Veuillez remplir tous les champs.', 'warning');
        return;
    }
    // Envoi des données de connexion
    const data = { email: email, motDePasse: password };
    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        // Vérifier si la réponse est OK
        if (!response.ok) {
            showAlert('Erreur', result.message, 'error');
            return;
        }

        // Connexion réussie, stocker les données utilisateur
        if (response.ok) {
            showAlert("Succès", "Connexion réussie !", "success");
        }

    } catch (error) {
        if (error instanceof TypeError && error.message === "Failed to fetch") {
            showAlert('Erreur', 'Problème de connexion au serveur.', 'error');
        } else {
            console.error('Erreur de connexion:', error);
            showAlert('Erreur', 'Une erreur est survenue lors de la connexion.', 'error');
        }
    }

});

//---Creation d'un nouveau utilisateur
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nomComplet = document.getElementById('nomComplet').value.trim();
    const email = document.getElementById('email_ins').value.trim();
    const password = document.getElementById('password_ins').value.trim();

    // Vérification des champs vides
    if (!nomComplet || !email || !password) {
        showAlert('Erreur', 'Veuillez remplir tous les champs.', 'warning');
        return;
    }
    // Afficher un indicateur de chargement
    Swal.fire({
        title: 'Inscription en cours...',
        html: 'Veuillez patienter...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    const data = { nomComplet: nomComplet, email: email, motDePasse: password };

    try {
        const response = await fetch('http://localhost:3000/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        // Vérifier si la réponse est OK
        if (!response.ok) {
            const errorMessage = result.errors
                ? result.errors.map(err => `• ${err.msg}`).join("\n") // 🔥 Ajoute une puce `•` pour chaque erreur
                : result.message || "Erreur lors de l'inscription.";
                showAlert("Erreur", errorMessage, "error");

            // showAlert('Erreur', result.message, 'error');
            // return;
        }
        // Connexion réussie, stocker les données utilisateur
        if (response.ok) {
            Swal.close();
            showAlert("Succès", result.message, "success");
        }

    } catch (err) {
        console.error("Erreur de requête :", err);
        showAlert("Erreur", `Une erreur s'est produite : ${err.message}`, "error");
    }


});


function showAlert(title, text, icon) {
    return Swal.fire({
        title,
        text,
        icon,
        confirmButtonText: 'OK'
    });
}