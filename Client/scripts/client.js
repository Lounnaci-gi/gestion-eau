 // Références aux éléments DOM
 const btnAddClient = document.getElementById('btnAddClient');
// Ouvrir le modal d'ajout de client
btnAddClient.addEventListener('click', function() {
    document.getElementById('clientModalTitle').textContent = 'Ajouter un nouveau client';
    clientForm.reset();
    clientModal.style.display = 'block';
    updateFieldsVisibility();
});