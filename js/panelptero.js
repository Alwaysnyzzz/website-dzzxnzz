// js/panelptero.js

(function() {
    // Fungsi update harga berdasarkan durasi
    const durasiButtons = document.querySelectorAll('.duration-btn');
    const harga3 = document.getElementById('harga3');
    const harga5 = document.getElementById('harga5');
    const harga6 = document.getElementById('harga6');
    const harga7 = document.getElementById('harga7');
    
    // Harga untuk 20 hari dan 30 hari
    const harga20 = {
        3: 4000,
        5: 6000,
        6: 8000,
        7: 11000
    };
    
    const harga30 = {
        3: 5000,
        5: 7000,
        6: 9000,
        7: 12000
    };

    function updateHarga(durasi) {
        const hargaData = durasi === '20' ? harga20 : harga30;

        if (harga3) harga3.innerHTML = `Rp ${hargaData[3].toLocaleString('id-ID')} <span>/${durasi} hari</span>`;
        if (harga5) harga5.innerHTML = `Rp ${hargaData[5].toLocaleString('id-ID')} <span>/${durasi} hari</span>`;
        if (harga6) harga6.innerHTML = `Rp ${hargaData[6].toLocaleString('id-ID')} <span>/${durasi} hari</span>`;
        if (harga7) harga7.innerHTML = `Rp ${hargaData[7].toLocaleString('id-ID')} <span>/${durasi} hari</span>`;

        // Update active class
        durasiButtons.forEach(btn => {
            if (btn.getAttribute('data-durasi') === durasi) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    durasiButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const durasi = this.getAttribute('data-durasi');
            updateHarga(durasi);
        });
    });

    // Set default 20 hari
    updateHarga('20');

    // Tombol pesan
    document.querySelectorAll('.btn-pesan').forEach(btn => {
        btn.addEventListener('click', function() {
            const panel = this.getAttribute('data-panel');
            const activeBtn = document.querySelector('.duration-btn.active');
            if (!activeBtn) return;
            
            const durasi = activeBtn.getAttribute('data-durasi');
            
            let harga;
            if (durasi === '20') {
                harga = harga20[panel];
            } else {
                harga = harga30[panel];
            }
            
            alert(`Anda memesan Panel ${panel}GB selama ${durasi} hari dengan harga Rp ${harga.toLocaleString('id-ID')}`);
        });
    });
})();