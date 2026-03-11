// js/pay.js

document.addEventListener('DOMContentLoaded', function() {
    // Ambil order_id dari URL
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

    // Elemen DOM
    const timerEl = document.getElementById('timer');
    const cekStatusBtn = document.getElementById('cek-status');
    const batalkanBtn = document.getElementById('batalkan');
    const downloadBtn = document.getElementById('downloadBtn');
    const qrContainer = document.getElementById('qrcode');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    const pendingModal = document.getElementById('pendingModal');
    const pendingOk = document.getElementById('pendingOk');
    const confirmModal = document.getElementById('confirmModal');
    const confirmYa = document.getElementById('confirmYa');
    const confirmTidak = document.getElementById('confirmTidak');

    // ===== Fungsi Loading =====
    function showLoading(text) {
        if (!loadingOverlay) return;
        loadingOverlay.classList.add('active');
        loadingText.textContent = text + ' ...';
        let dots = 0;
        loadingInterval = setInterval(() => {
            dots = (dots + 1) % 4;
            loadingText.textContent = text + ' ' + '.'.repeat(dots);
        }, 500);
    }

    function hideLoading() {
        if (!loadingOverlay) return;
        clearInterval(loadingInterval);
        loadingOverlay.classList.remove('active');
    }

    // ===== Load Transaksi dari API =====
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

            // Mulai countdown jika ada expired_at
            if (data.expired_at) {
                startCountdown(data.expired_at);
            } else {
                // Fallback 30 menit dari sekarang
                const fallbackExpired = new Date(Date.now() + 30 * 60000).toISOString();
                startCountdown(fallbackExpired);
            }

            // Generate QR Code
            if (data.qr_string) {
                qrContainer.innerHTML = '';
                const canvas = document.createElement('canvas');
                QRCode.toCanvas(canvas, data.qr_string, {
                    width: 180,
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
                qrContainer.innerHTML = '<p style="color:red;">QR tidak tersedia</p>';
            }
        } catch (err) {
            console.error(err);
            alert('Gagal memuat transaksi');
        }
    }

    // ===== Countdown Timer =====
    function startCountdown(expiredAt) {
        const expiredTime = new Date(expiredAt).getTime();

        function updateTimer() {
            const now = new Date().getTime();
            const distance = expiredTime - now;

            if (distance <= 0) {
                clearInterval(timerInterval);
                timerEl.innerHTML = '<i class="fas fa-hourglass-end"></i> EXPIRED';
                timerEl.style.background = 'rgba(255,0,0,0.2)';
                timerEl.style.borderColor = '#ff0000';
                // Disable buttons
                cekStatusBtn.disabled = true;
                batalkanBtn.disabled = true;
                downloadBtn.style.opacity = '0.5';
                downloadBtn.disabled = true;
                return;
            }

            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            timerEl.innerHTML = `<i class="fas fa-hourglass-half"></i> ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        updateTimer();
        timerInterval = setInterval(updateTimer, 1000);
    }

    // ===== Tombol Download QR =====
    downloadBtn.addEventListener('click', function() {
        if (qrCanvas) {
            const link = document.createElement('a');
            link.download = `qris-${orderId}.png`;
            link.href = qrCanvas.toDataURL('image/png');
            link.click();
        } else {
            alert('QR code belum tersedia');
        }
    });

    // ===== Tombol Cek Status =====
    cekStatusBtn.addEventListener('click', async function() {
        showLoading('Mengecek');
        try {
            const res = await fetch(`/api/check-status?order_id=${orderId}&amount=${transactionAmount}`);
            const data = await res.json();
            hideLoading();
            if (res.ok) {
                if (data.status === 'completed') {
                    // Redirect ke halaman sukses
                    window.location.href = `/success?order_id=${orderId}`;
                } else if (data.status === 'pending') {
                    // Tampilkan modal pending
                    if (pendingModal) pendingModal.classList.add('show');
                } else {
                    alert('Status: ' + data.status);
                }
            } else {
                alert('Gagal cek status: ' + (data.error || ''));
            }
        } catch (err) {
            hideLoading();
            alert('Error: ' + err.message);
        }
    });

    // ===== Tombol Batalkan =====
    batalkanBtn.addEventListener('click', function() {
        showLoading('Membatalkan');
        // Setelah 1 detik, tampilkan modal konfirmasi
        setTimeout(() => {
            hideLoading();
            if (confirmModal) confirmModal.classList.add('show');
        }, 1000);
    });

    // ===== Konfirmasi Batalkan =====
    if (confirmYa) {
        confirmYa.addEventListener('click', async function() {
            confirmModal.classList.remove('show');
            showLoading('Membatalkan');
            try {
                const res = await fetch('/api/cancel-transaction', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order_id: orderId, amount: transactionAmount })
                });
                hideLoading();
                if (res.ok) {
                    alert('Transaksi dibatalkan');
                    window.location.href = '/donasi';
                } else {
                    const data = await res.json();
                    alert('Gagal: ' + (data.error || ''));
                }
            } catch (err) {
                hideLoading();
                alert('Error: ' + err.message);
            }
        });
    }

    if (confirmTidak) {
        confirmTidak.addEventListener('click', function() {
            confirmModal.classList.remove('show');
        });
    }

    // ===== Tutup Modal Pending =====
    if (pendingOk) {
        pendingOk.addEventListener('click', function() {
            if (pendingModal) pendingModal.classList.remove('show');
        });
    }

    // Mulai
    loadTransaction();
});