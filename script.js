document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.getElementById('custom-cursor');
    const coordX = document.getElementById('coord-x');
    const coordY = document.getElementById('coord-y');
    const canvas = document.getElementById('map-canvas');
    const ctx = canvas.getContext('2d');
    const FORM_URL = 'https://forms.yandex.ru/u/6a0ad33784227c793c4ed748';

    let width, height;
    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    window.addEventListener('resize', resize);
    resize();

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        const lat = (55.765 + (e.clientY / height) * 0.01).toFixed(6);
        const lon = (37.684 + (e.clientX / width) * 0.01).toFixed(6);
        coordX.textContent = lat;
        coordY.textContent = lon;
    });

    const buildings = [];
    const numBuildings = 15;

    function createBuilding() {
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            w: 40 + Math.random() * 100,
            h: 40 + Math.random() * 100,
            opacity: 0,
            targetOpacity: 0.3 + Math.random() * 0.4,
            labeled: false,
            points: [
                {x: 0, y: 0},
                {x: 1, y: 0},
                {x: 1, y: 1},
                {x: 0, y: 1}
            ].map(p => ({
                x: (Math.random() - 0.5) * 10,
                y: (Math.random() - 0.5) * 10
            }))
        };
    }

    for (let i = 0; i < numBuildings; i++) {
        buildings.push(createBuilding());
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        buildings.forEach((b, i) => {
            if (Math.random() > 0.99 && !b.labeled) {
                b.labeled = true;
            }

            if (b.opacity < b.targetOpacity) b.opacity += 0.01;

            ctx.strokeStyle = b.labeled ? '#006CDC' : 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.rect(b.x, b.y, b.w, b.h);
            ctx.stroke();

            if (b.labeled) {
                ctx.fillStyle = '#006CDC';
                [
                    [b.x, b.y], [b.x + b.w, b.y],
                    [b.x, b.y + b.h], [b.x + b.w, b.y + b.h]
                ].forEach(p => {
                    ctx.beginPath();
                    ctx.arc(p[0], p[1], 3, 0, Math.PI * 2);
                    ctx.fill();
                });

                ctx.fillStyle = 'rgba(0, 108, 220, 0.8)';
                ctx.font = '10px monospace';
                ctx.fillText(`BUILDING_${i} [99.${Math.floor(Math.random()*9)}%]`, b.x, b.y - 5);
            }
            b.x -= 0.2;
            if (b.x + b.w < 0) {
                Object.assign(b, createBuilding());
                b.x = width;
            }
        });

        const scanY = (Date.now() / 20) % height;
        ctx.strokeStyle = 'rgba(0, 108, 220, 0.1)';
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(width, scanY);
        ctx.stroke();

        requestAnimationFrame(draw);
    }

    draw();

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#apply') {
                e.preventDefault();
                window.open(FORM_URL, '_blank');
            } else {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    const openModalBtns = document.querySelectorAll('.open-modal');
    const burgerMenu = document.querySelector('.burger-menu');
    const nav = document.querySelector('nav');

    function toggleMenu() {
        burgerMenu.classList.toggle('active');
        nav.classList.toggle('active');
        document.body.classList.toggle('modal-open');
    }

    if (burgerMenu) {
        burgerMenu.addEventListener('click', toggleMenu);
    }

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (nav && nav.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    openModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            window.open(FORM_URL, '_blank');
        });
    });

    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.bento-item, .hero-actions').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
});
