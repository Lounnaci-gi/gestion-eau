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

let i = 0;

document.querySelector('.add').addEventListener('click', () => {
    if (i < 2) {
        i++;

        const identite = document.createElement('div');
        const formgroup1 = document.createElement('div');
        const formgroup2 = document.createElement('div');
        const tele = document.createElement('input');
        const btn = document.createElement('i');

        // Ajout des classes
        btn.classList.add('fa-solid', 'fa-minus', 'remove-btn');
        identite.classList.add('Identite');
        formgroup1.classList.add('form-group');
        formgroup2.classList.add('form-group');

        // Configuration de l’input
        tele.type = "tel";
        tele.placeholder = "Téléphone " + i;

        // Construction du DOM
        formgroup1.appendChild(tele);
        formgroup2.appendChild(btn);
        identite.appendChild(formgroup1);
        identite.appendChild(formgroup2);

        document.querySelector('.form-row').appendChild(identite);

        // Suppression à clic sur le bouton "moins"
        btn.addEventListener('click', () => {
            identite.remove();
            i--;
        });
    }
});

btn.addEventListener('click', () => {
    identite.remove();
    i--;
});


// Fermer si on clique en dehors (optionnel)
// document.addEventListener('click', (e) => {
//     if (!clientFormContainer.contains(e.target) && e.target !== btnAddClient) {
//         clientFormContainer.style.display = 'none';
//     }
// });

