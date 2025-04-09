// Références aux éléments DOM
const btnAddClient = document.getElementById('btnAddClient');
const clientFormContainer = document.getElementById('clientFormContainer');
const clientForm = document.getElementById('clientForm');
const closeClientForm = document.getElementById('closeClientForm');

// Gestion de l'affichage du formulaire
btnAddClient.addEventListener('click', () => {
    clientFormContainer.style.display = 'block';
    btnAddClient.style.display = 'none';

    clientForm.reset();
    window.scrollTo({
        top: clientFormContainer.offsetTop - 20,
        behavior: 'smooth'
    });
});

// Fermeture du formulaire
closeClientForm.addEventListener('click', () => {
    clientFormContainer.style.display = 'none';
    btnAddClient.style.display = 'block';
});

// Gestion de la soumission
clientForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Récupération des données
    const formData = {
        Civilite: document.getElementById('clientStatus').value,
        raison_sociale: document.getElementById('raisonSociale').value,
        Adresse_correspondante: document.getElementById('adresscorrespendante').value,
        Code_postale: document.getElementById('codepostale').value,
        commune_correspondante: document.getElementById('commune_correspondante').value,
        Num_pic_identite: document.getElementById('numPicIdentite').value,
        email: document.getElementById('emailClient').value,
        telephone: document.getElementById('clientStatus').value,
        type_client: document.getElementById('clientCategorie').value

        // ... récupérer tous les autres champs ...
    };

    // Logique de sauvegarde (à adapter)
    console.log('Nouveau client:', formData);

    // Réinitialisation et fermeture
    clientFormContainer.style.display = 'none';
    clientForm.reset();
    btnAddClient.style.display = 'block';
});

// Fermer si on clique en dehors (optionnel)
// document.addEventListener('click', (e) => {
//     if (!clientFormContainer.contains(e.target) && e.target !== btnAddClient) {
//         clientFormContainer.style.display = 'none';
//     }
// });