
function formatPhoneInput(inputElement) {
    inputElement.addEventListener('input', function (e) {
        let input = e.target.value.replace(/\D/g, '');
        let formattedInput = '';

        if (input.length > 0) {
            formattedInput += input.substring(0, 4);
            if (input.length > 4) {
                formattedInput += ' ' + input.substring(4, 6);
            }
            if (input.length > 6) {
                formattedInput += ' ' + input.substring(6, 8);
            }
            if (input.length > 8) {
                formattedInput += ' ' + input.substring(8, 10);
            }
        }

        e.target.value = formattedInput;
    });
}

// Appliquer la fonction aux deux champs
formatPhoneInput(document.getElementById('structureTelephone'));
formatPhoneInput(document.getElementById('structureFax'));

// Fonction pour restreindre la saisie aux chiffres uniquement
function restrictToNumbers(inputElement) {
    inputElement.addEventListener('input', function (e) {
        // Remplacer tout ce qui n'est pas un chiffre par une chaîne vide
        e.target.value = e.target.value.replace(/\D/g, '');
    });
}

// Appliquer la fonction aux champs Compte Bancaire et Compte Postal
restrictToNumbers(document.getElementById('structureCompteBancaire'));
restrictToNumbers(document.getElementById('structureComptePostal'));


document.querySelector('.structure').addEventListener('submit', async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    const raison_sociale = document.getElementById("structureNom").value.trim();
    const prefixe = document.getElementById("structurePrefixe").value.trim().toUpperCase();
    const telephone = document.getElementById("structureTelephone").value.trim();
    const fax = document.getElementById("structureFax").value.trim();
    const email = document.getElementById("structureEmail").value;
    const adresse = document.getElementById("structureAdresse").value.trim();
    const compte_bancaire = document.getElementById("structureCompteBancaire").value;
    const compte_postal = document.getElementById("structureComptePostal").value;

    if (!raison_sociale || !prefixe || !email || !telephone || !adresse || !compte_bancaire || !compte_postal) {
        showAlert("Erreur", "Veuillez remplir tous les champs.", "warning");
        return;
    }

    const data = {
        raison_sociale: raison_sociale,
        prefixe: prefixe,
        telephone: telephone,
        fax: fax,
        email: email,
        adresse: adresse,
        compte_bancaire: compte_bancaire,
        compte_postal: compte_postal
    };

    try {
        const response = await fetch("http://localhost:3000/add_structure", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            credentials: 'include',
        });

    } catch (error) {

    }
});