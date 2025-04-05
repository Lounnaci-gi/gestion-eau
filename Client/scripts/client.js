// Références aux éléments DOM
const btnAddClient = document.getElementById('btnAddClient');
const clientFormContainer = document.getElementById('clientFormContainer');
const clientForm = document.getElementById('clientForm');
const closeClientForm = document.getElementById('closeClientForm');

// Gestion de l'affichage du formulaire
btnAddClient.addEventListener('click', () => {
    clientFormContainer.style.display = 'block';
    clientForm.reset();
    window.scrollTo({
        top: clientFormContainer.offsetTop - 20,
        behavior: 'smooth'
    });
});

// Fermeture du formulaire
closeClientForm.addEventListener('click', () => {
    clientFormContainer.style.display = 'none';
});

// Gestion de la soumission
clientForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Récupération des données
    const formData = {
        idDossier: document.getElementById('clientIdDossier').value,
        civilite: document.getElementById('clientStatus').value,
        // ... récupérer tous les autres champs ...
    };

    // Logique de sauvegarde (à adapter)
    console.log('Nouveau client:', formData);
    
    // Réinitialisation et fermeture
    clientFormContainer.style.display = 'none';
    clientForm.reset();
});

// Fermer si on clique en dehors (optionnel)
document.addEventListener('click', (e) => {
    if (!clientFormContainer.contains(e.target) && e.target !== btnAddClient) {
        clientFormContainer.style.display = 'none';
    }
});