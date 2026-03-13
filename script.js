// script.js

document.addEventListener('DOMContentLoaded', function() {
    // Sidebar toggle
    const menuBtn = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    if (menuBtn && sidebar && overlay) {
        menuBtn.onclick = function() {
            sidebar.classList.add('active');
            overlay.classList.add('active');
        };
        overlay.onclick = function() {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        };
    }

    // Dropdown menu toggle
    const menuTrigger = document.getElementById('menuTrigger');
    const dropdownMenu = document.getElementById('dropdownMenu');
    if (menuTrigger && dropdownMenu) {
        menuTrigger.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });

        // Tutup dropdown jika klik di luar
        document.addEventListener('click', function(e) {
            if (!menuTrigger.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('show');
            }
        });
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Hapus session (sesuaikan dengan sistem login Anda)
            localStorage.removeItem('sb-session'); // untuk Supabase
            // Redirect ke halaman login
            window.location.href = '/login';
        });
    }

    // Canvas stars (background)
    const canvas = document.getElementById('canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let stars = [];
        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        const createStars = () => {
            stars = [];
            for (let i = 0; i < 70; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 1.5,
                    speed: Math.random() * 0.2 + 0.1
                });
            }
        };
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "rgba(0, 229, 255, 0.15)";
            stars.forEach(s => {
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                ctx.fill();
                s.y += s.speed;
                if (s.y > canvas.height) s.y = 0;
            });
            requestAnimationFrame(draw);
        };
        window.addEventListener('resize', () => { resize(); createStars(); });
        resize(); createStars(); draw();
    }
});