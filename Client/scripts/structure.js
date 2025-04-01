// Fonction réutilisable pour formater les numéros de téléphone
function formatPhoneInput(inputElement) {
    inputElement.addEventListener('input', function (e) {
        let input = e.target.value.replace(/\D/g, ''); // Supprimer tous les caractères non numériques
        let formattedInput = '';

        if (input.length > 0) {
            if (input.startsWith('02') || input.startsWith('03') || input.startsWith('04')) {
                // Format pour téléphone fixe : 025 77 66 13
                formattedInput += input.substring(0, 3); // Les 3 premiers chiffres
                if (input.length > 3) {
                    formattedInput += ' ' + input.substring(3, 5);
                }
                if (input.length > 5) {
                    formattedInput += ' ' + input.substring(5, 7);
                }
                if (input.length > 7) {
                    formattedInput += ' ' + input.substring(7, 9);
                }
            } else if (input.startsWith('05') || input.startsWith('06') || input.startsWith('07')) {
                // Format pour téléphone mobile : 0563 97 94 46
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
            } else {
                // Si le numéro ne correspond à aucun des formats attendus
                formattedInput = input;
            }
        }

        e.target.value = formattedInput;
    });
}

// Fonction pour restreindre la saisie aux chiffres uniquement
function restrictToNumbers(inputElement) {
    inputElement.addEventListener('input', function (e) {
        e.target.value = e.target.value.replace(/\D/g, '');
    });
}

// Variables globales pour gérer l'état
let choix = "creation_structure";
let structure_id = null;

// Fonction pour afficher des alertes avec SweetAlert2
function showAlert(title, message, icon) {
    return Swal.fire({
        title: title,
        text: message,
        icon: icon,
        confirmButtonText: "OK"
    });
}

// Fonction pour charger et afficher la liste des structures
async function loadStructures() {
    try {
        Swal.fire({
            title: "Chargement...",
            html: "Récupération des structures...",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const response = await fetch(`${API_BASE_URL}/liste_structure`, {
            method: "GET",
            credentials: 'include',
        });

        Swal.close();

        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.errors && Array.isArray(errorData.errors)
                ? errorData.errors.map(err => `⚠️ ${err.msg}`).join("\n")
                : errorData.message || "Erreur lors de la récupération des structures.";

            throw new Error(errorMessage);
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
            populateStructureTable(data.data);

            const listeSection = document.querySelector('.structure_liste');
            listeSection.classList.add("show");
            listeSection.scrollIntoView({ behavior: 'smooth' });
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
            <td>${escapeHtml(structure.raison_sociale) || "Non renseigné"}</td>
            <td>${escapeHtml(structure.prefixe) || "Non renseigné"}</td>
            <td>${escapeHtml(structure.adresse) || "Non renseigné"}</td>
            <td>${escapeHtml(structure.telephone) || "Non renseigné"}</td>
            <td>${escapeHtml(structure.fax) || "Non renseigné"}</td>
            <td>${escapeHtml(structure.email) || "Non renseigné"}</td>
            <td>${escapeHtml(structure.nom_compte_bancaire) || "Non renseigné"}</td>
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

    // Animation des lignes
    const rows = structureTableBody.querySelectorAll('tr');
    rows.forEach((row, index) => {
        row.style.animationDelay = `${0.15 * index}s`;
    });
}

// Fonction de filtrage des structures
function filterStructures(searchText) {
    const rows = document.querySelectorAll('#structureTableBody tr');
    rows.forEach(row => {
        const rowText = row.innerText.toLowerCase();
        row.style.display = rowText.includes(searchText) ? '' : 'none';
    });
}

// Fonction pour éditer une structure
async function editStructure(structureid) {
    try {
        Swal.fire({
            title: "Chargement des données...",
            html: "Veuillez patienter...",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        const response = await fetch(`${API_BASE_URL}/liste_structure/${structureid}`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Échec de la récupération des données");
        }

        const data = await response.json();
        Swal.close();

        // Mettre à jour les variables d'état
        choix = 'update_structure';
        structure_id = structureid;

        // Remplir le formulaire avec les données de la structure
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

        // Afficher le formulaire d'édition
        const creationSection = document.querySelector('.structure_creation');
        creationSection.classList.add("show");
        creationSection.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        Swal.close();
        showAlert("Erreur", error.message || "Une erreur est survenue", "error");
    }
}

// Fonction pour supprimer une structure
async function deleteStructure(structureid) {
    try {
        // Demander confirmation avant de supprimer
        const confirmation = await Swal.fire({
            title: "Confirmer la suppression ?",
            text: "Voulez-vous vraiment supprimer cette structure ?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Oui, supprimer !",
            cancelButtonText: "Annuler"
        });

        if (!confirmation.isConfirmed) {
            return; // Annulation de la suppression
        }

        Swal.fire({
            title: "Suppression en cours...",
            html: "Veuillez patienter...",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        const response = await fetch(`${API_BASE_URL}/liste_structure/${structureid}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.errors && Array.isArray(errorData.errors)
                ? errorData.errors.map(err => `⚠️ ${err.msg}`).join("\n")
                : errorData.message || "Erreur lors de la suppression.";

            throw new Error(errorMessage);
        }

        const data = await response.json();
        Swal.close();

        await showAlert("Succès", data.message || "Structure supprimée avec succès", "success");

        // Recharger le tableau des structures
        await loadStructures();
    } catch (error) {
        Swal.close();
        showAlert("Erreur", error.message || "Une erreur est survenue lors de la suppression", "error");
    }
}

// Fonction pour soumettre le formulaire de création/modification
async function submitStructureForm(e) {
    e.preventDefault();

    // Récupérer les valeurs du formulaire
    const raison_sociale = document.getElementById("structureNom").value.trim();
    const prefixe = document.getElementById("structurePrefixe").value.trim().toUpperCase();
    const telephone = document.getElementById("structureTelephone").value.trim();
    const fax = document.getElementById("structureFax").value.trim();
    const email = document.getElementById("structureEmail").value.trim();
    const adresse = document.getElementById("structureAdresse").value.trim();
    const compte_bancaire = document.getElementById("structureCompteBancaire").value.trim();
    const nom_compte_bancaire = document.getElementById("nombanque").value.trim();
    const compte_postal = document.getElementById("structureComptePostal").value.trim();

    // Valider les champs obligatoires
    if (!raison_sociale || !prefixe || !email || !telephone || !adresse || !compte_bancaire || !compte_postal) {
        showAlert("Erreur", "Veuillez remplir tous les champs obligatoires.", "warning");
        return;
    }

    // Demander confirmation
    const confirmation = await Swal.fire({
        title: "Confirmer l'enregistrement ?",
        text: "Voulez-vous vraiment enregistrer cette structure ?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Oui, enregistrer !",
        cancelButtonText: "Annuler"
    });

    if (!confirmation.isConfirmed) {
        return;
    }

    // Afficher un loader
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
        // Déterminer l'URL et la méthode basées sur l'opération
        let url, methode;

        if (choix === "creation_structure") {
            url = `${API_BASE_URL}/add_structure`;
            methode = "POST";
        } else if (choix === "update_structure") {
            url = `${API_BASE_URL}/liste_structure/${structure_id}`;
            methode = "PUT";
        } else {
            throw new Error("Opération non reconnue");
        }

        const response = await fetch(url, {
            method: methode,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.errors && Array.isArray(errorData.errors)
                ? errorData.errors.map(err => `⚠️ ${err.msg}`).join("\n")
                : errorData.message || "Erreur lors de l'enregistrement.";

            throw new Error(errorMessage);
        }

        Swal.close();
        await showAlert("Succès", "Enregistrement réussi !", "success");

        // Réinitialiser le formulaire et l'état
        document.getElementById('create_structure').reset();
        choix = "creation_structure";
        structure_id = null;

        // Masquer le formulaire de création
        if (choix === "update_structure") {
            document.querySelector('.structure_creation').classList.remove('show');
        }

        // Recharger la liste des structures
        await loadStructures();
    } catch (error) {
        Swal.close();
        showAlert("Erreur", error.message || "Une erreur est survenue lors de l'enregistrement", "error");
    }
}

// ============= INITIALISATION DES ÉVÉNEMENTS =============

// Appliquer le formatage aux champs téléphone/fax
document.addEventListener('DOMContentLoaded', function () {
    // Formatter les numéros de téléphone
    formatPhoneInput(document.getElementById('structureTelephone'));
    formatPhoneInput(document.getElementById('structureFax'));

    // Restreindre à des chiffres uniquement
    restrictToNumbers(document.getElementById('structureCompteBancaire'));
    restrictToNumbers(document.getElementById('structureComptePostal'));

    // Écouteur pour afficher la liste des structures
    document.getElementById('liste_structure').addEventListener('click', async (e) => {
        e.preventDefault();
        await loadStructures();
    });

    // Écouteur pour le champ de recherche
    const searchInput = document.getElementById('structureSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            filterStructures(this.value.toLowerCase());
        });
    }

    // Écouteurs pour les boutons de fermeture
    const closeButtons = document.querySelectorAll(".close-auth1");
    closeButtons.forEach(button => {
        button.addEventListener("click", () => {
            const container = button.closest(".structure_liste") || button.closest(".structure_creation");
            if (container && container.classList.contains("show")) {
                container.classList.remove("show");
            }
        });
    });

    // Écouteur pour afficher le formulaire de création
    document.querySelector('#creation_structure').addEventListener('click', () => {
        // Réinitialiser le formulaire et l'état
        document.getElementById('create_structure').reset();
        choix = "creation_structure";
        structure_id = null;

        // Afficher le formulaire
        const creationSection = document.querySelector('.structure_creation');
        creationSection.classList.add("show");
        creationSection.scrollIntoView({ behavior: 'smooth' });
    });

    // Écouteur pour le formulaire de création/modification
    document.getElementById('create_structure').addEventListener('submit', submitStructureForm);
});

