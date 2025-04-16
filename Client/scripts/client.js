
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

function verfier (e){
    e.forEach(element => {
        element.addEventListener('blur'),()=>{

        }
    
});
}
// document.getElementById("numPicIdentite").addEventListener('blur', () => {
//     if (document.getElementById("numPicIdentite").value.trim() !== '') {
//         document.getElementById("delivrePar").setAttribute("required", true);
//         document.getElementById("dateDelivrance").setAttribute("required", true);
//         document.getElementById("delivrePar").removeAttribute("readonly");
//         document.getElementById("dateDelivrance").removeAttribute("readonly");
//     } else {
//         document.getElementById("delivrePar").setAttribute("readonly", true);
//         document.getElementById("dateDelivrance").setAttribute("readonly", true);
//         document.getElementById("delivrePar").value = '';
//         document.getElementById("dateDelivrance").value = '';
//     }

// })

// Gestion de la soumission
clientForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Récupération des données
    const formData = {
        Civilite: document.getElementById('clientStatus').value.trim(),
        raison_sociale: document.getElementById('raisonSociale').value.trim(),
        type_client: document.getElementById('clientCategorie').value.trim(),
        nom: document.getElementById('nom').value.trim(),
        prenom: document.getElementById('prenom').value.trim(),
        quartier: document.getElementById('quartier').value.trim(),
        rue: document.getElementById('rue').value.trim(),
        commune_correspondante: document.getElementById('commune_correspondante').value.trim(),
        Code_postale: document.getElementById('codepostale').value.trim(),

        Num_pic_identite: {
            numero: document.getElementById('numPicIdentite').value.trim(),
            delivrePar: document.getElementById('delivrePar').value.trim(),
            dateDelivrance: document.getElementById('dateDelivrance').value.trim() || null
        },

        email: document.getElementById('emailClient').value.trim(),
        telephone: [
            document.getElementById('telephone1').value.trim(),
            document.getElementById('telephone2').value.trim()
        ].filter(phone => phone !== ""),

        fax: document.getElementById('fax').value.trim(),
    };
    // Logique de sauvegarde (à adapter)


    // Réinitialisation et fermeture
    clientFormContainer.style.display = 'none';
    clientForm.reset();
    btnAddClient.style.display = 'block';

    const response = await fetch(`${API_BASE_URL}/add_client`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: 'include', // Inclure les cookies        
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la connexion");
    }
    const data = await response.json();
    console.log(data.data);
});



document.addEventListener('DOMContentLoaded', (e) => {
    e.preventDefault();
    const toggleclientType = () => {

        if (document.getElementById('clientType').value !== 'particulier') {
            document.querySelector('.form-group-raison-sociale').style.display = 'block';
            document.getElementById('raisonSociale').setAttribute('required', '');
            document.querySelector('.nom').style.display = 'none';
            document.getElementById('nom').removeAttribute('required');
            document.getElementById('prenom').removeAttribute('required');

        }
        else {
            document.querySelector('.form-group-raison-sociale').style.display = 'none';
            document.getElementById('raisonSociale').removeAttribute('required');
            document.querySelector('.nom').style.display = 'block';
            document.getElementById('nom').setAttribute('required', '');
            document.getElementById('prenom').setAttribute('required', '');
        }
    }
    toggleclientType();
    document.getElementById('clientType').addEventListener('change', toggleclientType);
    formatPhoneInput(document.getElementById('telephone1'));
    formatPhoneInput(document.getElementById('telephone2'));
    formatPhoneInput(document.getElementById('fax'));
    formatDateInput(document.getElementById('dateDelivrance'));

//------------------------------------
const numPicIdentite = document.getElementById("numPicIdentite");
        const delivrePar = document.getElementById("delivrePar");
        const dateDelivrance = document.getElementById("dateDelivrance");

        function updateReadonlyState() {
            const isEmpty = numPicIdentite.value.trim() === "";
            delivrePar.readOnly = isEmpty;
            dateDelivrance.readOnly = isEmpty;

            delivrePar.required = !isEmpty;
            dateDelivrance.required = !isEmpty;
        }

        // Vérifie au chargement initial
        updateReadonlyState();

        // Met à jour en temps réel si l'utilisateur tape dans numPicIdentite
        numPicIdentite.addEventListener("input", updateReadonlyState);
});
// Fermer si on clique en dehors (optionnel)
// document.addEventListener('click', (e) => {
//     if (!clientFormContainer.contains(e.target) && e.target !== btnAddClient) {
//         clientFormContainer.style.display = 'none';
//     }
// });

