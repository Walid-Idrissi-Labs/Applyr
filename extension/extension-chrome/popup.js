document.addEventListener('DOMContentLoaded', () => {
    const btnSubmit = document.querySelector('.btn-submit');
    const statusSelect = document.getElementById('status');

    btnSubmit.addEventListener('click', () => {
        const selectedStatus = statusSelect.value;
        const role = document.querySelector('.role').textContent;
        const company = document.querySelector('.company').textContent;

        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Envoi en cours...';

        setTimeout(() => {
            btnSubmit.textContent = '✨ Succès !';
            btnSubmit.style.backgroundColor = '#4ade80'; // a success green
            btnSubmit.style.color = '#111';
            
            console.log(`Candidature importée : ${role} chez ${company} (Statut: ${selectedStatus})`);
            
            setTimeout(() => {
                window.close();
            }, 1500);
        }, 1000);
    });
});
