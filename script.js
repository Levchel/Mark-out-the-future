document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.getElementById('custom-cursor');
    const coordX = document.getElementById('coord-x');
    const coordY = document.getElementById('coord-y');
    const canvas = document.getElementById('map-canvas');
    const ctx = canvas.getContext('2d');

    // Настройка Canvas
    let width, height;
    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    window.addEventListener('resize', resize);
    resize();

    // Кастомный курсор и координаты
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';

        // Имитация координат Lat/Lon
        const lat = (55.765 + (e.clientY / height) * 0.01).toFixed(6);
        const lon = (37.684 + (e.clientX / width) * 0.01).toFixed(6);
        coordX.textContent = lat;
        coordY.textContent = lon;
    });

    // Анимация карты на Canvas
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
        
        // Отрисовка зданий (bounding boxes)
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
                // Рисуем "узлы"
                ctx.fillStyle = '#006CDC';
                [
                    [b.x, b.y], [b.x + b.w, b.y],
                    [b.x, b.y + b.h], [b.x + b.w, b.y + b.h]
                ].forEach(p => {
                    ctx.beginPath();
                    ctx.arc(p[0], p[1], 3, 0, Math.PI * 2);
                    ctx.fill();
                });

                // Текст метки
                ctx.fillStyle = 'rgba(0, 108, 220, 0.8)';
                ctx.font = '10px monospace';
                ctx.fillText(`BUILDING_${i} [99.${Math.floor(Math.random()*9)}%]`, b.x, b.y - 5);
            }

            // Плавное движение (дрейф карты)
            b.x -= 0.2;
            if (b.x + b.w < 0) {
                Object.assign(b, createBuilding());
                b.x = width;
            }
        });

        // Линии сетки (сканирование)
        const scanY = (Date.now() / 20) % height;
        ctx.strokeStyle = 'rgba(0, 108, 220, 0.1)';
        ctx.beginPath();
        ctx.moveTo(0, scanY);
        ctx.lineTo(width, scanY);
        ctx.stroke();

        requestAnimationFrame(draw);
    }

    draw();

    // Плавная прокрутка для якорных ссылок
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#apply') {
                openModal();
            } else {
                document.querySelector(targetId).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Логика модального окна
    const modal = document.getElementById('apply-modal');
    const openModalBtns = document.querySelectorAll('.open-modal');
    const closeModalBtn = document.querySelector('.close-modal');

    function openModal() {
        modal.classList.remove('hidden');
        document.body.classList.add('modal-open');
    }

    function closeModal() {
        modal.classList.add('hidden');
        document.body.classList.remove('modal-open');
    }

    openModalBtns.forEach(btn => {
        btn.addEventListener('click', openModal);
    });

    closeModalBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Закрытие по ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });

    // Эффект появления при скролле (Intersection Observer)
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
