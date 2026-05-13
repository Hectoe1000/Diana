import * as THREE from 'three';

let scene, camera, renderer, petals;
const petalCount = 300;
const velocities = [];
let petalTexture;

// ==========================================
// THREE.JS - PÉTALOS
// ==========================================



function initPetals() {
    const loader = new THREE.TextureLoader();
    petalTexture = loader.load('./src/petalo.webp');

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
// NARRATIVA DE SCROLL - FUNDIDO SECUENCIAL
// ==========================================
function initNarrativeScroll() {
    const container = document.querySelector('.narrative-container');
    if (!container) return;

    const slide1 = document.querySelector('.narrative-slide-1');
    const slide2 = document.querySelector('.narrative-slide-2');
    const slide3 = document.querySelector('.narrative-slide-3');
    const scrollIndicator = document.querySelector('.scroll-indicator');

    // Elementos hijos para animar
    const slide1Text = slide1 ? slide1.querySelector('h2') : null;
    const slide2Text = slide2 ? slide2.querySelector('h1') : null;
    const slide3Content = slide3 ? slide3.querySelector('div') : null;

    function handleScroll() {
        const containerRect = container.getBoundingClientRect();
        const containerHeight = container.offsetHeight;
        const viewportHeight = window.innerHeight;

        // Cuánto hemos scrolleado dentro del contenedor
        const scrolled = -containerRect.top;
        const maxScroll = containerHeight - viewportHeight;
        const progress = Math.max(0, Math.min(1, scrolled / maxScroll));

        // ==========================================
        // FASE 1: Fiesta de Graduación (0% - 30%)
        // Se desvanece al bajar
        // ==========================================
        if (slide1Text) {
            if (progress < 0.30) {
                const fadeOut = progress / 0.30;
                slide1Text.style.opacity = 1 - fadeOut;
                slide1Text.style.transform = `translateY(${-50 * fadeOut}px)`;
                slide1Text.style.filter = `blur(${fadeOut * 6}px)`;
            } else {
                slide1Text.style.opacity = '0';
                slide1Text.style.transform = 'translateY(-50px)';
                slide1Text.style.filter = 'blur(6px)';
            }
        }

        // ==========================================
        // FASE 2: LUMINA MATRIS (15% - 50%)
        // Aparece y luego se desvanece
        // ==========================================
        if (slide2Text) {
            if (progress > 0.15 && progress < 0.35) {
                // Aparece
                const fadeIn = (progress - 0.15) / 0.20;
                slide2Text.style.opacity = Math.min(1, fadeIn);
                slide2Text.style.transform = `translateY(${30 * (1 - Math.min(1, fadeIn))}px)`;
            } else if (progress >= 0.35 && progress < 0.50) {
                // Permanece visible
                slide2Text.style.opacity = '1';
                slide2Text.style.transform = 'translateY(0)';
            } else if (progress >= 0.50 && progress < 0.60) {
                // Se desvanece
                const fadeOut = (progress - 0.50) / 0.10;
                slide2Text.style.opacity = 1 - fadeOut;
                slide2Text.style.transform = `translateY(${-40 * fadeOut}px)`;
                slide2Text.style.filter = `blur(${fadeOut * 4}px)`;
            } else if (progress >= 0.60) {
                slide2Text.style.opacity = '0';
                slide2Text.style.transform = 'translateY(-40px)';
                slide2Text.style.filter = 'blur(4px)';
            } else {
                slide2Text.style.opacity = '0';
                slide2Text.style.transform = 'translateY(30px)';
            }
        }

        // ==========================================
        // FASE 3: Obstetricia + Diana Mery (55% - 100%)
        // Aparece y se mantiene
        // ==========================================
        if (slide3Content) {
            if (progress > 0.55 && progress < 0.80) {
                const fadeIn = (progress - 0.55) / 0.25;
                slide3Content.style.opacity = Math.min(1, fadeIn);
                slide3Content.style.transform = `translateY(${40 * (1 - Math.min(1, fadeIn))}px)`;
            } else if (progress >= 0.80) {
                slide3Content.style.opacity = '1';
                slide3Content.style.transform = 'translateY(0)';
            } else {
                slide3Content.style.opacity = '0';
                slide3Content.style.transform = 'translateY(40px)';
            }
        }

        // ==========================================
        // INDICADOR DE SCROLL
        // ==========================================
        if (scrollIndicator) {
            if (progress < 0.05) {
                scrollIndicator.style.opacity = '1';
            } else if (progress < 0.15) {
                scrollIndicator.style.opacity = Math.max(0, 1 - (progress - 0.05) / 0.10);
            } else {
                scrollIndicator.style.opacity = '0';
            }
        }
    }

    // Optimización con requestAnimationFrame
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // También para touchmove
    window.addEventListener('touchmove', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Ejecutar al cargar
    handleScroll();
    window.addEventListener('resize', handleScroll);
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

