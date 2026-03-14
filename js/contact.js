// === COPY TOTAL & PASTE DI js/contact.js ===
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.modern-contact-card[data-modal]');
    const modals = document.querySelectorAll('.modal-overlay');
    const closeButtons = document.querySelectorAll('.close-modal');

    // Fungsi buka modal
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Kunci scroll latar
            
            // Feedback Visual (Getar di HP jika didukung)
            if (window.navigator && window.navigator.vibrate) {
                window.navigator.vibrate(50);
            }
        }
    }

    // Fungsi tutup semua modal
    function closeAllModals() {
        modals.forEach(modal => modal.classList.remove('active'));
        document.body.style.overflow = ''; // Aktifkan scroll latar
    }

    // Klik tombol detail di card
    cards.forEach(card => {
        const btn = card.querySelector('.btn-connect');
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
