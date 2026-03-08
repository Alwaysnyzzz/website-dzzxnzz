// success.js
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');

    if (!orderId) {
        window.location.href = '/';
        return;
    }

    document.getElementById('order-id').textContent = orderId;

    // Ambil data transaksi untuk waktu & tanggal
    fetch(`/api/get-transaction?order_id=${orderId}`)
        .then(res => res.json())
        .then(data => {
            if (data && !data.error) {
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
        .catch(() => {
            const now = new Date();
            document.getElementById('waktu').textContent = now.toLocaleTimeString('id-ID');
            document.getElementById('tanggal').textContent = now.toLocaleDateString('id-ID');
        });
});