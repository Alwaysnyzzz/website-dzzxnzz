// js/success.js

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');

    if (!orderId) {
        window.location.href = '/';
        return;
    }

    // Ambil data transaksi dari API untuk mengisi detail
    fetch(`/api/get-transaction?order_id=${orderId}`)
        .then(res => res.json())
        .then(data => {
            if (data && !data.error) {
                document.getElementById('order-id').textContent = data.order_id;
                const timestamp = data.created_at || data.expired_at;
                if (timestamp) {
                    const date = new Date(timestamp);
                    const waktu = date.toLocaleTimeString('id-ID', { 
                        hour: '2-digit', 
                        minute: '2-digit', 
                        second: '2-digit',
                        hour12: false 
                    });
                    const tanggal = date.toLocaleDateString('id-ID', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                    });
                    document.getElementById('waktu').textContent = waktu;
                    document.getElementById('tanggal').textContent = tanggal;
                } else {
                    const now = new Date();
                    document.getElementById('waktu').textContent = now.toLocaleTimeString('id-ID');
                    document.getElementById('tanggal').textContent = now.toLocaleDateString('id-ID');
                }
            } else {
                const now = new Date();
                document.getElementById('waktu').textContent = now.toLocaleTimeString('id-ID');
                document.getElementById('tanggal').textContent = now.toLocaleDateString('id-ID');
            }
        })
        .catch(err => {
            console.error('Gagal ambil data transaksi:', err);
            const now = new Date();
            document.getElementById('waktu').textContent = now.toLocaleTimeString('id-ID');
            document.getElementById('tanggal').textContent = now.toLocaleDateString('id-ID');
        });

    // Tampilkan modal setelah halaman dimuat
    setTimeout(() => {
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.classList.add('show');
        }
    }, 500);

    // Tombol Kembali ke Home
    document.getElementById('btnHome').addEventListener('click', function() {
        window.location.href = '/';
    });

    // Tombol Lihat Struk (masih contoh)
    document.getElementById('btnStruk').addEventListener('click', function() {
        alert('Fitur lihat struk akan segera tersedia');
    });

    // ===== PERUBAHAN: Tombol Kirim sekarang redirect ke Contact =====
    document.getElementById('btnKirim').addEventListener('click', function() {
        window.location.href = '/contact';
    });
});