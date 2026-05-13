import * as THREE from 'three';
import petalImg from './src/petalo.webp';

let scene, camera, renderer, petals;
const petalCount = 300;
const velocities = [];
let petalTexture;

// ==========================================
// THREE.JS - PÉTALOS
// ==========================================



function initPetals() {
    const loader = new THREE.TextureLoader();
    petalTexture = loader.load(petalImg);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('petal-container').appendChild(renderer.domElement);

    createPetals();
    window.addEventListener('resize', onWindowResize);
    animatePetals();
}

function createPetals() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(petalCount * 3);

    for (let i = 0; i < petalCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 15;
        positions[i * 3 + 1] = Math.random() * 15;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

        velocities.push({
            y: Math.random() * 0.02 + 0.01,
            x: (Math.random() - 0.5) * 0.01,
            delay: Math.random() * 100
        });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        size: 0.25,
        map: petalTexture,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    petals = new THREE.Points(geometry, material);
    scene.add(petals);
}

function animatePetals() {
    requestAnimationFrame(animatePetals);

    const positions = petals.geometry.attributes.position.array;

    for (let i = 0; i < petalCount; i++) {
        positions[i * 3 + 1] -= velocities[i].y;
        positions[i * 3] += Math.sin(Date.now() * 0.001 + i) * 0.005;

        if (positions[i * 3 + 1] < -6) {
            positions[i * 3 + 1] = 7;
            positions[i * 3] = (Math.random() - 0.5) * 15;
        }
    }

    petals.geometry.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ==========================================
// NARRATIVA POR BOTONES
// ==========================================
function initNarrativeScroll() {
    const slides = [
        document.getElementById('slide-1'),
        document.getElementById('slide-2'),
        document.getElementById('slide-3'),
    ];
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');

    if (!slides[0] || !btnNext || !btnPrev) return;

    let current = 0;
    const total = slides.length;

    function showSlide(index, direction) {
        const prevSlide = slides[current];
        const nextSlide = slides[index];

        // Salida del actual
        prevSlide.classList.remove('active');
        prevSlide.classList.add(direction === 'forward' ? 'exit-up' : 'exit-down');

        // Preparar entrada: clase que define posición inicial
        nextSlide.classList.remove('exit-up', 'exit-down', 'active', 'enter-from-bottom', 'enter-from-top');
        nextSlide.classList.add(direction === 'forward' ? 'enter-from-bottom' : 'enter-from-top');

        // Forzar reflow para que el navegador registre la clase antes de activar
        nextSlide.getBoundingClientRect();

        // Activar — dispara la transición CSS
        nextSlide.classList.remove('enter-from-bottom', 'enter-from-top');
        nextSlide.classList.add('active');

        // Limpiar clases de salida tras la transición
        setTimeout(() => {
            prevSlide.classList.remove('exit-up', 'exit-down');
        }, 900);

        current = index;
        updateButtons();
    }

    function updateButtons() {
        btnPrev.style.display = current === 0 ? 'none' : 'flex';
        
        const spanText = btnNext.querySelector('span');
        if (current === total - 1) {
            btnNext.style.display = 'flex';
            if (spanText) spanText.innerText = 'Ver Invitación';
        } else {
            btnNext.style.display = 'flex';
            if (spanText) spanText.innerText = 'Siguiente';
        }
    }

    btnNext.addEventListener('click', () => {
        if (current < total - 1) {
            showSlide(current + 1, 'forward');
        } else if (current === total - 1) {
            // Ocultar narrativa y mostrar contenido restante
            const narrativeContainer = document.querySelector('.narrative-container');
            const contenidoRestante = document.getElementById('contenido-restante');
            const audio = document.getElementById('musicaGala');
            
            if (audio && audio.paused) {
                audio.play().catch(e => console.log('Audio autoplay prevented'));
            }

            if (contenidoRestante) {
                contenidoRestante.style.display = 'block';
                // Pequeño retardo para que la transición de opacidad funcione bien
                setTimeout(() => {
                    contenidoRestante.style.opacity = '1';
                    // Hacer scroll suave hacia el contenido que acaba de aparecer (debajo del 100vh)
                    window.scrollTo({
                        top: window.innerHeight,
                        behavior: 'smooth'
                    });
                }, 50);
            }
            
            btnNext.style.display = 'none';
            btnPrev.style.display = 'none';
        }
    });

    btnPrev.addEventListener('click', () => {
        if (current > 0) showSlide(current - 1, 'backward');
    });

    // Activar primer slide
    slides[0].classList.add('active');
    updateButtons();
}

// ==========================================
// SISTEMA DE ESTRELLAS ALREDEDOR DE LUMINA
// ==========================================
function initStars() {
    const luminaSection = document.querySelector('.lumina-section');
    if (!luminaSection) return;

    const starContainer = document.createElement('div');
    starContainer.className = 'stars-container';
    starContainer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 25;
        overflow: visible;
    `;
    luminaSection.appendChild(starContainer);

    function createStar(type = 'normal') {
        const star = document.createElement('div');
        star.className = `star-particle ${type}`;

        const angle = Math.random() * Math.PI * 2;
        const distance = 60 + Math.random() * 200;
        const x = 50 + Math.cos(angle) * (distance / luminaSection.offsetWidth * 100);
        const y = 50 + Math.sin(angle) * (distance / luminaSection.offsetHeight * 100);

        const size = 2 + Math.random() * 5;
        const duration = 2 + Math.random() * 4;
        const delay = Math.random() * 3;

        star.style.cssText = `
            left: ${x}%;
            top: ${y}%;
            width: ${size}px;
            height: ${size}px;
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
            opacity: 0;
        `;

        starContainer.appendChild(star);

        setTimeout(() => {
            if (star.parentNode) star.remove();
            createStar(type);
        }, (duration + delay) * 1000);
    }

    function createTrail() {
        const trail = document.createElement('div');
        trail.className = 'glow-trail';

        const startX = 30 + Math.random() * 40;
        const startY = 20 + Math.random() * 60;
        const duration = 2 + Math.random() * 3;
        const delay = Math.random() * 2;

        trail.style.cssText = `
            left: ${startX}%;
            top: ${startY}%;
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
        `;

        starContainer.appendChild(trail);

        setTimeout(() => {
            if (trail.parentNode) trail.remove();
            createTrail();
        }, (duration + delay) * 1000);
    }

    function createCrossStar() {
        const star = document.createElement('div');
        star.className = 'star-particle spark';

        const x = 20 + Math.random() * 60;
        const y = 20 + Math.random() * 60;
        const size = 3 + Math.random() * 4;
        const duration = 1.5 + Math.random() * 2.5;
        const delay = Math.random() * 4;

        star.style.cssText = `
            left: ${x}%;
            top: ${y}%;
            width: ${size}px;
            height: ${size}px;
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
            background: radial-gradient(circle, 
                rgba(255,255,255,1) 0%, 
                rgba(255,215,0,0.8) 40%, 
                transparent 70%);
        `;

        starContainer.appendChild(star);

        setTimeout(() => {
            if (star.parentNode) star.remove();
            createCrossStar();
        }, (duration + delay) * 1000);
    }

    // Inicializar estrellas
    for (let i = 0; i < 15; i++) {
        setTimeout(() => createStar('normal'), i * 200);
    }

    for (let i = 0; i < 8; i++) {
        setTimeout(() => createCrossStar(), i * 300);
    }

    for (let i = 0; i < 10; i++) {
        setTimeout(() => createTrail(), i * 250);
    }

    // Estrellas esporádicas
    setInterval(() => {
        if (Math.random() > 0.5) {
            createStar('spark');
        }
    }, 2000);

    // Explosión al hacer clic en LUMINA
    luminaSection.style.cursor = 'pointer';
    luminaSection.addEventListener('click', (e) => {
        const rect = luminaSection.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        for (let i = 0; i < 6; i++) {
            const star = document.createElement('div');
            star.className = 'star-particle spark';
            star.style.cssText = `
                left: ${x + (Math.random() - 0.5) * 20}%;
                top: ${y + (Math.random() - 0.5) * 20}%;
                width: ${3 + Math.random() * 5}px;
                height: ${3 + Math.random() * 5}px;
                animation-duration: ${0.8 + Math.random() * 1.5}s;
                background: radial-gradient(circle, 
                    rgba(255,255,255,1) 0%, 
                    rgba(255,215,0,0.9) 30%, 
                    transparent 70%);
                z-index: 30;
            `;
            starContainer.appendChild(star);
            setTimeout(() => star.remove(), 2000);
        }
    });
}

// ==========================================
// INICIAR TODO
// ==========================================
function initAll() {
    // Audio: se activa con el primer click del usuario
    window.addEventListener('click', () => {
        const audio = document.getElementById('musicaGala');
        if (audio && audio.paused) {
            audio.play();
        }
    }, { once: true });

    initPetals();
    initNarrativeScroll();
    initStars();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
} else {
    initAll();
}

