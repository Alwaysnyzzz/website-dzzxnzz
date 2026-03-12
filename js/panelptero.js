// js/panelptero.js

(function() {
    // Data harga per durasi untuk masing-masing panel (dalam rupiah)
    const hargaData = {
        3: { 10: 3000, 15: 4500, 20: 6000, 30: 9000 },   // panel 3GB
        5: { 10: 5000, 15: 7500, 20: 10000, 30: 15000 }   // panel 5GB
    };

    // Fungsi untuk mengupdate tampilan berdasarkan panel dan durasi
    function updatePanel(panelId, durasi) {
        const badge = document.getElementById(`durasiBadge${panelId}`);
        const hargaEl = document.getElementById(`harga${panelId}`);
        if (badge) badge.textContent = durasi + ' Hari';
        if (hargaEl) {
            const harga = hargaData[panelId][durasi];
            hargaEl.innerHTML = `Rp ${harga.toLocaleString('id-ID')} <span>/${durasi} hari</span>`;
        }

        // Update active class pada tombol durasi di panel ini
        const buttons = document.querySelectorAll(`.duration-btn-small[data-panel="${panelId}"]`);
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-durasi') == durasi);
        });
    }

    // Set default untuk masing-masing panel
    updatePanel('3', 10);
    updatePanel('5', 10);

    // Event listener untuk semua tombol durasi
    document.querySelectorAll('.duration-btn-small').forEach(btn => {
        btn.addEventListener('click', function() {
            const panel = this.getAttribute('data-panel');
            const durasi = this.getAttribute('data-durasi');
            updatePanel(panel, durasi);
        });
    });

    // Event listener untuk tombol pesan (contoh, bisa diarahkan ke checkout)
    document.querySelectorAll('.btn-pesan').forEach(btn => {
        btn.addEventListener('click', function() {
            // Cari panel terdekat untuk mendapatkan informasi
            const card = this.closest('.panel-card');
            const panelId = card.id === 'panel3gb' ? '3' : '5';
            const activeBtn = card.querySelector('.duration-btn-small.active');
            const durasi = activeBtn ? activeBtn.getAttribute('data-durasi') : '10';
            const harga = hargaData[panelId][durasi];
            alert(`Anda memilih Panel ${panelId === '3' ? '3GB' : '5GB'} selama ${durasi} hari dengan harga Rp ${harga.toLocaleString('id-ID')}`);
            // Nanti bisa redirect ke halaman pembayaran
        });
    });
})();