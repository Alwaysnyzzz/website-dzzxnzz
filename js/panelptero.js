// js/panelptero.js

(function() {
    // Data harga untuk panel 3GB
    const hargaData = {
        10: 3000,
        15: 4500,
        20: 6000,
        30: 9000
    };

    const hargaEl = document.getElementById('harga');
    const durasiButtons = document.querySelectorAll('.duration-btn');
    const btnPesan = document.getElementById('btnPesan');

    function updateHarga(durasi) {
        const harga = hargaData[durasi];
        hargaEl.innerHTML = `Rp ${harga.toLocaleString('id-ID')} <span>/${durasi} hari</span>`;
        
        // Update active class
        durasiButtons.forEach(btn => {
            const btnDurasi = btn.getAttribute('data-durasi');
            if (btnDurasi == durasi) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Event listener untuk tombol durasi
    durasiButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const durasi = this.getAttribute('data-durasi');
            updateHarga(durasi);
        });
    });

    // Set default 10 hari
    updateHarga('10');

    // Tombol pesan
    if (btnPesan) {
        btnPesan.addEventListener('click', function() {
            const activeBtn = document.querySelector('.duration-btn.active');
            const durasi = activeBtn ? activeBtn.getAttribute('data-durasi') : '10';
            const harga = hargaData[durasi];
            alert(`Anda memesan Panel 3GB selama ${durasi} hari dengan harga Rp ${harga.toLocaleString('id-ID')}`);
            // Nanti redirect ke halaman pembayaran
        });
    }
})();