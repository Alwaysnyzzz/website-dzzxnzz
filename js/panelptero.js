// js/panelptero.js

(function() {
    const buttons = document.querySelectorAll('.duration-btn');
    const durasiBadge = document.getElementById('durasiBadge');
    const hargaElement = document.getElementById('harga');
    
    // Harga per durasi (bisa disesuaikan)
    const hargaPerDurasi = {
        10: 4500,
        15: 6000,
        20: 7500,
        30: 10000
    };

    function updateCard(durasi) {
        durasiBadge.textContent = durasi + ' Hari';
        hargaElement.innerHTML = `Rp ${hargaPerDurasi[durasi].toLocaleString('id-ID')} <span>/${durasi} hari</span>`;
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            buttons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const durasi = this.getAttribute('data-durasi');
            updateCard(durasi);
        });
    });

    // Set default aktif 10 hari
    if (buttons[0]) {
        buttons[0].classList.add('active');
        updateCard(10);
    }
})();