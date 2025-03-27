
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


// Fonction pour charger et afficher la liste des structures
async function loadStructures() {
   
    try {
        const response = await fetch("http://localhost:3000/liste_structure", {
            method: "GET",
            credentials: 'include',
        });

        if (!response.ok) throw new Error("Erreur de chargement des structures");

        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
            populateStructureTable(data.data); // Utilisez data.data
        } else {
            throw new Error("Format de données invalide");
        }
    } catch (error) {
        showAlert("Erreur", error.message || "Une erreur est survenue.", "error");
    }
}

// Remplir le tableau des structures
function populateStructureTable(structures) {
    const structureTableBody = document.getElementById('structureTableBody');
    if (!Array.isArray(structures)) {
        console.error("Expected an array of structures, got:", structures);
        return;
    }

    structureTableBody.innerHTML = structures.map(structure => `
        <tr>
            <td>${structure.raison_sociale || "Non renseigné"}</td>
            <td>${structure.prefixe || "Non renseigné"}</td>
            <td>${structure.adresse || "Non renseigné"}</td>
            <td>${structure.telephone || "Non renseigné"}</td>
            <td>${structure.fax || "Non renseigné"}</td>
            <td>${structure.email || "Non renseigné"}</td>
            <td>${structure.nom_compte_bancaire || "Non renseigné"}</td>
            <td class="action-buttons">
                <button class="edit-btn" onclick="editStructure('${structure._id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="deleteStructure('${structure._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join("");
    // Ajouter une animation d'entrée aux lignes
    const rows = structureTableBody.querySelectorAll('tr');
    rows.forEach((row, index) => {
        row.style.animationDelay = `${0.15 * index}s`;
    });

}


// Écouteur d'événement pour afficher la liste des structures
document.getElementById('liste_structure').addEventListener('click', async (e) => {
    e.preventDefault();
    const listeSection = document.querySelector('.structure_liste');
    listeSection.classList.add("show");
    await loadStructures();
    listeSection.scrollIntoView({ behavior: 'smooth' });

});

function filterStructures(searchText) {
    const rows = document.querySelectorAll('#structureTableBody tr');
    rows.forEach(row => {
        const rowText = row.innerText.toLowerCase();
        if (rowText.includes(searchText)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

setTimeout(() => {
    const searchInput = document.getElementById('structureSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            filterStructures(this.value.toLowerCase());
        });
    }
}, 100);

const closeButtons = document.querySelectorAll(".close-auth1");

closeButtons.forEach(button => {
    button.addEventListener("click", () => {
        // On cherche le conteneur parent qui a la classe "structure_liste" ou "structure_creation"
        const container = button.closest(".structure_liste") || button.closest(".structure_creation");
        if (container && container.classList.contains("show")) {
            container.classList.remove("show");
        }
    });
});


document.querySelector('#creation_structure').addEventListener('click', () => {
    const creationSection = document.querySelector('.structure_creation');
    creationSection.classList.add("show");
    creationSection.scrollIntoView({ behavior: 'smooth' });
});

document.querySelector('#create_structure').addEventListener('submit', async (e) => {
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


    // 🔥 Demander confirmation avant d'envoyer les données
    const confirmation = await Swal.fire({
        title: "Confirmer l'enregistrement ?",
        text: "Voulez-vous vraiment ajouter cette structure ?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Oui, enregistrer !",
        cancelButtonText: "Annuler"
    });

    if (!confirmation.isConfirmed) {
        return; // ⛔ Ne rien faire si l'utilisateur annule
    }

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
        showAlert("Succès", "Enregistrement réussi !", "success");
        const form = document.querySelector('.structure');
        form.reset();

    } catch (error) {
        showAlert("Erreur", error.message || "Une erreur est survenue.", "error");
    }
});

// Modifier la fonction editUser
function editStructure(structureid) {
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

        // Récupérer les détails de structure
        fetch(`http://localhost:3000/liste/${structureid}`, {
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
            document.getElementById('editUserId').value = structureid;
            document.getElementById('structureNom').value = data.data.raison_sociale;
            document.getElementById('structurePrefixe').value = data.data.prefixe;
            document.getElementById('structureTelephone').value = data.data.telephone;
            document.getElementById('structureFax').value = data.data.fax;
            document.getElementById('structureEmail').value = data.data.email;
            document.getElementById('structureAdresse').value = data.data.adresse;
            document.getElementById('structureCompteBancaire').value = data.data.compte_bancaire;
            document.getElementById('nombanque').value = data.data.nom_compte_bancaire;
            document.getElementById('structureComptePostal').value = data.data.compte_postal;
            
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