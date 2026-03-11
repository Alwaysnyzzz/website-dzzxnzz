// js/panelptero.js

(function() {
    // ===== Particle system (background) =====
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let w, h, particles = [];

        function resize() {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
            initParticles();
        }

        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.size = Math.random() * 2;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
                this.life = Math.random() * 0.5 + 0.5;
                this.color = Math.random() > 0.5 ? '#00e5ff' : '#00ff88';
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) this.reset();
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
                ctx.fillStyle = this.color;
                ctx.globalAlpha = this.life;
                ctx.shadowBlur = 10;
                ctx.shadowColor = this.color;
                ctx.fill();
                ctx.globalAlpha = 1;
                ctx.shadowBlur = 0;
            }
        }

        function initParticles() {
            particles = [];
            const count = w < 480 ? 40 : 80;
            for (let i=0; i<count; i++) particles.push(new Particle());
        }

        function animate() {
            ctx.clearRect(0, 0, w, h);
            particles.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', resize);
        resize();
        animate();
    }

    // ===== Interaksi durasi =====
    const buttons = document.querySelectorAll('.duration-btn');
    const durasiBadge = document.getElementById('durasiBadge');
    const hargaElement = document.getElementById('harga');
    const hargaPerDurasi = {10: 4500, 15: 6000, 20: 7500, 30: 10000};

    function updateCard(durasi) {
        durasiBadge.textContent = durasi + ' HARI';
        hargaElement.innerHTML = `Rp ${hargaPerDurasi[durasi].toLocaleString('id-ID')} <span class="price-period">/${durasi} HARI</span>`;
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            buttons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const durasi = this.getAttribute('data-durasi');
            updateCard(durasi);
        });
    });

    // Set default aktif 10 hari
    buttons[0]?.classList.add('active');
    updateCard(10);
})();