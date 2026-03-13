// script.js

document.addEventListener('DOMContentLoaded', function() {
    // ===== SIDEBAR TOGGLE =====
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

    // ===== FUNGSI CEK LOGIN (sesuaikan dengan sistem autentikasi) =====
    function isLoggedIn() {
        // Contoh: cek localStorage dari Supabase
        return localStorage.getItem('sb-session') !== null;
    }

    // ===== UPDATE SIDEBAR SYSTEM MENU =====
    const systemMenu = document.getElementById('system-menu');
    if (systemMenu) {
        if (isLoggedIn()) {
            systemMenu.innerHTML = `
                <li class="system-item"><a href="/profile"><i class="fas fa-user-circle"></i> Akun</a></li>
                <li class="system-item"><a href="#" id="sidebarLogout"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
            `;
            const sidebarLogout = document.getElementById('sidebarLogout');
            if (sidebarLogout) {
                sidebarLogout.addEventListener('click', function(e) {
                    e.preventDefault();
                    localStorage.removeItem('sb-session');
                    window.location.reload(); // refresh untuk update
                });
            }
        } else {
            systemMenu.innerHTML = `
                <li class="system-item"><a href="/login"><i class="fas fa-sign-in-alt"></i> Login</a></li>
                <li class="system-item"><a href="/register"><i class="fas fa-user-plus"></i> Register</a></li>
            `;
        }
    }

    // ===== DROPDOWN MENU DI NAVBAR =====
    const menuTrigger = document.getElementById('menuTrigger');
    const dropdownMenu = document.getElementById('dropdownMenu');

    if (menuTrigger && dropdownMenu) {
        // Fungsi untuk mengupdate isi dropdown sesuai status login
        function updateDropdown() {
            if (isLoggedIn()) {
                dropdownMenu.innerHTML = `
                    <a href="/profile" class="dropdown-item"><i class="fas fa-user"></i> Akun</a>
                    <a href="#" id="dropdownLogout" class="dropdown-item"><i class="fas fa-sign-out-alt"></i> Logout</a>
                `;
                const dropdownLogout = document.getElementById('dropdownLogout');
                if (dropdownLogout) {
                    dropdownLogout.addEventListener('click', function(e) {
                        e.preventDefault();
                        localStorage.removeItem('sb-session');
                        window.location.reload();
                    });
                }
            } else {
                dropdownMenu.innerHTML = `
                    <a href="/login" class="dropdown-item"><i class="fas fa-sign-in-alt"></i> Login</a>
                    <a href="/register" class="dropdown-item"><i class="fas fa-user-plus"></i> Register</a>
                `;
            }
        }

        // Toggle dropdown saat ikon diklik
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

        // Inisialisasi pertama
        updateDropdown();
    }

    // ===== CANVAS STARS (background) =====
    const canvas = document.getElementById('canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let stars = [];

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function createStars() {
            stars = [];
            const starCount = Math.min(70, Math.floor(window.innerWidth / 20));
            for (let i = 0; i < starCount; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 1.5 + 0.5,
                    speed: Math.random() * 0.2 + 0.1
                });
            }
        }

        function drawStars() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "rgba(0, 229, 255, 0.15)";
            ctx.shadowBlur = 5;
            ctx.shadowColor = "#00e5ff";
            stars.forEach(s => {
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                ctx.fill();
                s.y += s.speed;
                if (s.y > canvas.height) {
                    s.y = 0;
                    s.x = Math.random() * canvas.width;
                }
            });
            requestAnimationFrame(drawStars);
        }

        window.addEventListener('resize', function() {
            resizeCanvas();
            createStars();
        });

        resizeCanvas();
        createStars();
        drawStars();
    }
});