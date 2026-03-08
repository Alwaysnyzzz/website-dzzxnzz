// js/pay.js

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');

    if (!orderId) {
        alert('Order ID tidak ditemukan!');
        window.location.href = '/donasi';
        return;
    }

    let transactionAmount = 0;
    let qrCanvas = null;
    let timerInterval;
    let loadingInterval;

    // Fungsi loading overlay
    function showLoadingOverlay(duration, text, callback) {
        const overlay = document.getElementById('loadingOverlay');
        const loadingText = document.getElementById('loadingText');
        let dots = 0;
        overlay.classList.add('active');
        loadingText.textContent = text + ' ...';

        loadingInterval = setInterval(() => {
            dots = (dots + 1) % 4;
            loadingText.textContent = text + ' ' + '.'.repeat(dots);
        }, 500);

        setTimeout(() => {
            clearInterval(loadingInterval);
            overlay.classList.remove('active');
            if (callback) callback();
        }, duration);
    }

    // Fungsi success overlay
    function showSuccessOverlay() {
        document.getElementById('successOverlay').classList.add('active');
    }

    function hideSuccessOverlay() {
        document.getElementById('successOverlay').classList.remove('active');
    }

    // Countdown berdasarkan expired_at
    function startCountdown(expiredAt) {
        const timerElement = document.getElementById('timer');
        const expiredTime = new Date(expiredAt).getTime();

        function updateTimer() {
            const now = new Date().getTime();
            const distance = expiredTime - now;

            if (distance <= 0) {
                clearInterval(timerInterval);
                timerElement.innerHTML = '⏰ EXPIRED';
                timerElement.style.background = 'rgba(255,0,0,0.4)';
                timerElement.style.color = '#ffffff';
                // Disable buttons
                document.getElementById('cek-status').disabled = true;
                document.getElementById('batalkan').disabled = true;
                document.getElementById('downloadBtn').style.opacity = '0.5';
                document.getElementById('downloadBtn').disabled = true;
                return;
            }

            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            timerElement.innerHTML = `⏳ ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        updateTimer();
        timerInterval = setInterval(updateTimer, 1000);
    }

    // Load transaksi
    async function loadTransaction() {
        try {
            const res = await fetch(`/api/get-transaction?order_id=${orderId}`);
            const data = await res.json();
            if (!data || data.error) {
                alert('Transaksi tidak ditemukan');
                window.location.href = '/donasi';
                return;
            }

            transactionAmount = data.amount;

            if (data.expired_at) {
                startCountdown(data.expired_at);
            }

            if (data.qr_string) {
                const qrContainer = document.getElementById('qrcode');
                qrContainer.innerHTML = '';

                const canvas = document.createElement('canvas');
                QRCode.toCanvas(canvas, data.qr_string, {
                    width: 160,
                    margin: 1,
                    errorCorrectionLevel: 'H',
                    color: { dark: '#000000', light: '#ffffff' }
                }, function(error) {
                    if (error) {
                        console.error('QR Error:', error);
                        qrContainer.innerHTML = '<p style="color:red;">Gagal generate QR</p>';
                    } else {
                        qrContainer.appendChild(canvas);
                        qrCanvas = canvas;
                    }
                });
            } else {
                document.getElementById('qrcode').innerHTML = '<p style="color:red;">QR tidak tersedia</p>';
            }
        } catch (err) {
            console.error(err);
            alert('Gagal memuat transaksi');
        }
    }

    // Tombol download QR
    document.getElementById('downloadBtn').addEventListener('click', function() {
        if (qrCanvas) {
            const link = document.createElement('a');
            link.download = `qris-${orderId}.png`;
            link.href = qrCanvas.toDataURL('image/png');
            link.click();
        } else {
            alert('QR code belum tersedia');
        }
    });

    // Tombol cek status
    document.getElementById('cek-status').onclick = async () => {
        showLoadingOverlay(1500, 'Mengecek', async () => {
            try {
                const res = await fetch(`/api/check-status?order_id=${orderId}&amount=${transactionAmount}`);
                const data = await res.json();
                if (res.ok) {
                    if (data.status === 'completed') {
                        showSuccessOverlay();
                    } else if (data.status === 'pending') {
                        document.getElementById('pendingModal').classList.add('active');
                    } else {
                        alert('Status: ' + data.status);
                    }
                } else {
                    alert('Gagal cek status: ' + (data.error || ''));
                }
            } catch (err) {
                alert('Error: ' + err.message);
            }
        });
    };

    // Tombol batalkan
    document.getElementById('batalkan').onclick = () => {
        showLoadingOverlay(1700, 'Tunggu Sebentar', () => {
            document.getElementById('modalOverlay').classList.add('active');
        });
    };

    // Modal Ya
    document.getElementById('modalYa').onclick = () => {
        document.getElementById('modalOverlay').classList.remove('active');
        showLoadingOverlay(1200, 'loading', () => {
            window.location.href = '/donasi';
        });
    };

    // Modal Tidak
    document.getElementById('modalTidak').onclick = () => {
        document.getElementById('modalOverlay').classList.remove('active');
    };

    // Modal Pending OK
    document.getElementById('pendingOk').onclick = () => {
        document.getElementById('pendingModal').classList.remove('active');
    };

    // Tombol Bukti
    document.getElementById('btnBukti').onclick = () => {
        hideSuccessOverlay();
        alert('Fitur bukti pembayaran akan segera tersedia');
    };

    // Mulai
    loadTransaction();
});