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