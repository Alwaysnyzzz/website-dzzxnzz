// js/contact.js
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.modern-card[data-modal]');
    const modals = document.querySelectorAll('.modal-overlay'); // Pastikan class sesuai
    const closeButtons = document.querySelectorAll('.close-modal');

    // Fungsi buka modal
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Kunci scroll
        }
    }

    // Fungsi tutup semua modal
    function closeAllModals() {
        modals.forEach(modal => modal.classList.remove('active'));
        document.body.style.overflow = 'auto'; // Aktifkan scroll
    }

    // Klik tombol detail di card
    cards.forEach(card => {
        const btn = card.querySelector('.btn-detail');
        if (btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const modalId = card.getAttribute('data-modal');
                openModal(modalId);
            });
        }
    });

    // Klik tombol close (X)
    closeButtons.forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    // Klik di luar area modal untuk menutup
    window.addEventListener('click', function(e) {
        modals.forEach(modal => {
            if (e.target === modal) closeAllModals();
        });
    });

    // Tombol ESC untuk menutup
    window.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeAllModals();
    });
});
