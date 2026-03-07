// donasi.js - interaksi halaman donasi
document.addEventListener("DOMContentLoaded", () => {
    const donasiBtn = document.querySelector(".donasi-btn");
    const donasiInput = document.querySelector(".donasi-input");

    if (donasiBtn && donasiInput) {
        donasiBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const nominal = donasiInput.value;
            if (!nominal || nominal < 1000) {
                alert("Minimal donasi Rp 1.000");
                donasiInput.focus();
                return;
            }
            alert(`Terima kasih! Anda akan donasi Rp ${nominal}`);
        });
    }
});