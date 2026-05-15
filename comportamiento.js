// ===== Fade bidireccional al hacer scroll =====
const fadeElements = document.querySelectorAll('.fade');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        } else {
            entry.target.classList.remove('visible');
        }
    });
}, { threshold: 0.12 });

fadeElements.forEach(el => observer.observe(el));


// ===== Botón volver arriba =====
const backToTop = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 300);
});

backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});


// ===== Partículas =====
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

let W = canvas.width = window.innerWidth;
let H = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
});

const mouse = { x: W / 2, y: H / 2 };
let mouseMoving = false;
let mouseStopTimer = null;
let clicking = false;

window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouseMoving = true;
    clearTimeout(mouseStopTimer);
    mouseStopTimer = setTimeout(() => { mouseMoving = false; }, 150);
});

window.addEventListener('mousedown', () => { clicking = true; });

window.addEventListener('mouseup', () => {
    clicking = false;
    // Al soltar: dispersión uniforme garantizada por ángulos distribuidos
    particles.forEach((p, i) => {
        const angle = (i / particles.length) * Math.PI * 2 + (Math.random() - 0.5) * 1.5;
        const force = Math.random() * 16 + 10;
        p.vx = Math.cos(angle) * force;
        p.vy = Math.sin(angle) * force;
    });
});

// Genera posición aleatoria fuera de pantalla
function offscreenPos() {
    const side = Math.floor(Math.random() * 4);
    if (side === 0) return { x: Math.random() * W, y: -30 };
    if (side === 1) return { x: W + 30, y: Math.random() * H };
    if (side === 2) return { x: Math.random() * W, y: H + 30 };
    return { x: -30, y: Math.random() * H };
}

const PARTICLE_COUNT = 70;

// 25% de partículas empiezan fuera de pantalla para el efecto de atracción al hacer click
const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const isOff = i < PARTICLE_COUNT * 0.25;
    const pos = isOff ? offscreenPos() : { x: Math.random() * W, y: Math.random() * H };
    return {
        x: pos.x,
        y: pos.y,
        driftX: (Math.random() - 0.5) * 0.35,
        driftY: (Math.random() - 0.5) * 0.35,
        vx: 0,
        vy: 0,
        size: Math.random() * 2.2 + 0.8,
        alpha: Math.random() * 0.45 + 0.2,
    };
});

function drawParticles() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        if (clicking) {
            // Atracción fuerte hacia el mouse, incluso desde fuera de pantalla
            const force = Math.min(2.5, 15 / (dist * 0.04 + 1));
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
            p.vx *= 0.87;
            p.vy *= 0.87;
        } else if (mouseMoving && dist < 180) {
            // Atracción leve solo mientras el mouse se mueve y está cerca
            p.vx += (dx / dist) * 0.06;
            p.vy += (dy / dist) * 0.06;
            p.vx *= 0.91;
            p.vy *= 0.91;
        } else {
            // Reposo: frena suavemente, solo deriva autónoma
            p.vx *= 0.95;
            p.vy *= 0.95;
        }

        p.x += p.driftX + p.vx;
        p.y += p.driftY + p.vy;

        // Wrap en bordes con margen para las que vienen de afuera
        if (p.x < -40)  p.x = W + 40;
        if (p.x > W + 40) p.x = -40;
        if (p.y < -40)  p.y = H + 40;
        if (p.y > H + 40) p.y = -40;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 60, 60, ${p.alpha})`;
        ctx.fill();
    });

    // Líneas entre partículas cercanas
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(255, 60, 60, ${0.18 * (1 - dist / 120)})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    }

    requestAnimationFrame(drawParticles);
}

drawParticles();


// ===== Caja de comentarios con localStorage =====
const formComentario = document.getElementById('form-comentario');
const listaComentarios = document.getElementById('lista-comentarios');

function cargarComentarios() {
    const comentarios = JSON.parse(localStorage.getItem('comentarios') || '[]');
    listaComentarios.innerHTML = '';
    comentarios.forEach(c => renderComentario(c));
}

function renderComentario(c) {
    const div = document.createElement('div');
    div.className = 'comentario-item';
    div.innerHTML = `
        <div class="comentario-nombre">${escapeHtml(c.nombre)}</div>
        <div class="comentario-texto">${escapeHtml(c.texto)}</div>
        <div class="comentario-fecha">${c.fecha}</div>
    `;
    listaComentarios.prepend(div);
}

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

formComentario.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombre-input').value.trim();
    const texto = document.getElementById('comentario-input').value.trim();
    if (!nombre || !texto) return;

    const comentarios = JSON.parse(localStorage.getItem('comentarios') || '[]');
    const nuevo = { nombre, texto, fecha: new Date().toLocaleString('es') };
    comentarios.push(nuevo);
    localStorage.setItem('comentarios', JSON.stringify(comentarios));
    renderComentario(nuevo);
    formComentario.reset();
});

cargarComentarios();
