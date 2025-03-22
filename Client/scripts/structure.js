
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
    const nom_compte_bancaire = document.getElementById("nombanque").value;

    const compte_postal = document.getElementById("structureComptePostal").value;

    if (!raison_sociale || !prefixe || !email || !telephone || !adresse || !compte_bancaire || !compte_postal) {
        showAlert("Erreur", "Veuillez remplir tous les champs.", "warning");
        return;
    }
    Swal.fire({
        title: "Enregistrer nouvelle structure",
        text: "Êtes-vous sûr de vouloir enregistrer ?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Oui, Enregistrer",
        cancelButtonText: "Annuler",
        showLoaderOnConfirm: true
    });

    // Afficher un loader pendant l'inscription
    Swal.fire({
        title: "Enregistrement en cours...",
        html: "Veuillez patienter...",
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });

    const data = {
        raison_sociale,
        prefixe,
        telephone,
        fax,
        email,
        adresse,
        compte_bancaire,
        nom_compte_bancaire,
        compte_postal
    };

    try {
        const response = await fetch("http://localhost:3000/add_structure", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Erreur lors de l'enregistrement.");
        }


        Swal.close();
        showAlert("Succès", "Enregistrement réussie !", "success");
        const form = document.querySelector('.structure');
        form.reset();

    } catch (error) {
        showAlert("Erreur", error.message || "Une erreur est survenue.", "error");
    }
});