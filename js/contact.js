// Modal handling for contact page
document.addEventListener('DOMContentLoaded', function() {
    // Ambil semua card yang memiliki data-modal
    const cards = document.querySelectorAll('.modern-card[data-modal]');
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close');

    // Fungsi untuk membuka modal
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    // Fungsi untuk menutup semua modal
    function closeAllModals() {
        modals.forEach(modal => {
            modal.classList.remove('active');
        });
    }

    // Event listener untuk setiap card
    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Cegah jika yang diklik adalah tombol atau link
            if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;
            
            const modalId = this.getAttribute('data-modal');
            openModal(modalId);
        });

        // Jika tombol "Lihat Detail" di dalam card diklik
        const btn = card.querySelector('.btn-detail');
        if (btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const modalId = card.getAttribute('data-modal');
                openModal(modalId);
            });
        }
    });

    // Event listener untuk tombol close (X)
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            closeAllModals();
        });
    });

    // Tutup modal jika klik di luar konten modal
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    });

    // Tutup modal dengan tombol ESC
    window.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
});