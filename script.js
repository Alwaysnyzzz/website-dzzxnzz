// Loading screen logic (untuk halaman home)
document.addEventListener('DOMContentLoaded', function() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        const bar = document.querySelector('.progress-bar');
        const text = document.getElementById('progress-text');
        if (sessionStorage.getItem('homeLoaded')) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => loadingScreen.style.display = 'none', 600);
            return;
        }
        let progress = 0;
        const steps = [20,40,60,80,100];
        let stepIndex = 0;
        function goToNextStep() {
            if (stepIndex >= steps.length) {
                sessionStorage.setItem('homeLoaded','true');
                setTimeout(() => {
                    loadingScreen.style.opacity = '0';
                    setTimeout(() => loadingScreen.style.display = 'none', 600);
                },300);
                return;
            }
            const target = steps[stepIndex];
            const interval = setInterval(() => {
                if (progress < target) {
                    progress++;
                    bar.style.width = progress+'%';
                    text.textContent = progress+'%';
                } else {
                    clearInterval(interval);
                    stepIndex++;
                    if (stepIndex < steps.length) setTimeout(goToNextStep,500);
                    else goToNextStep();
                }
            },20);
        }
        goToNextStep();
    }

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

    // Canvas bintang (background)
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