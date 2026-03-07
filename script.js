document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.getElementById("menu-toggle");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");
    const cards = document.querySelectorAll(".card");

    // Sidebar Logic
    menuBtn.onclick = () => { sidebar.classList.add("active"); overlay.classList.add("active"); };
    overlay.onclick = () => { sidebar.classList.remove("active"); overlay.classList.remove("active"); };

    // Card Selection Logic
    cards.forEach(card => {
        card.onclick = () => {
            cards.forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
        };
    });

    // Background Stars (Canvas)
    const canvas = document.getElementById('canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let stars = [];
        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        const createStars = () => {
            stars = [];
            for (let i = 0; i < 50; i++) {
                stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, size: Math.random() * 1.2, speed: Math.random() * 0.2 + 0.1 });
            }
        };
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "rgba(0, 229, 255, 0.25)";
            stars.forEach(s => {
                ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2); ctx.fill();
                s.y += s.speed; if (s.y > canvas.height) s.y = 0;
            });
            requestAnimationFrame(draw);
        };
        window.addEventListener('resize', () => { resize(); createStars(); });
        resize(); createStars(); draw();
    }
});