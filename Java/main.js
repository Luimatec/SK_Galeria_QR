const WHATSAPP_NUMBER = "8090000000"; 

// ARRAY DE ANUNCIOS (Tus rutas locales exactas)
const ads = [
    {
        id: 1,
        type: "image",
        title: "Taller Multimedia",
        category: "Capacitación Servidores",
        description: "Pruebaaaa.",
        url: "img/anuncio1.jpg", 
        duration: 5000,
        whatsappText: "Hola! Vi el anuncio de Combo de Desayuno en el QR y quiero ordenar."
    },
    {
        id: 2,
        type: "image",
        title: "Pensamiento del Dia",
        category: "Proximas Actividades",
        description: "prueba.",
        url: "img/anuncio2.jpg", 
        duration: 5000,
        whatsappText: "Hola! Vi el anuncio de Alquiler de Equipos y quiero solicitar una cotización."
    },
    {
        id: 3,
        type: "image",
        title: "Pensamiento del Dia",
        category: "Disciplado",
        description: "Prueba de contenido local.",
        url: "img/anuncio3.jpg", 
        duration: 5000,
        whatsappText: "Hola! Vi el anuncio de prueba y quiero más información."
    }
];

let currentIndex = 0;
let isPaused = false;
let isMuted = true;
let progressInterval = null;
let currentProgress = 0;
let activeVideo = null;

const slidesContainer = document.getElementById('slidesContainer');
const progressSegments = document.getElementById('progressSegments');
const adCounter = document.getElementById('adCounter');
const adCategory = document.getElementById('adCategory');
const adTitle = document.getElementById('adTitle');
const adDescription = document.getElementById('adDescription');
const whatsappCta = document.getElementById('whatsappCta');
const togglePlayBtn = document.getElementById('togglePlayBtn');
const playIcon = document.getElementById('playIcon');
const toggleMuteBtn = document.getElementById('toggleMuteBtn');
const muteIcon = document.getElementById('muteIcon');
const pauseIndicator = document.getElementById('pauseIndicator');
const infoBtn = document.getElementById('infoBtn');

function initGallery() {
    // Crear las barras de progreso superiores una sola vez
    progressSegments.innerHTML = '';
    ads.forEach((_, idx) => {
        const segmentDiv = document.createElement('div');
        segmentDiv.className = 'h-1 bg-white/30 rounded-full flex-1 overflow-hidden';
        segmentDiv.innerHTML = `<div id="prog-fill-${idx}" class="progress-bar-fill h-full bg-white w-0"></div>`;
        progressSegments.appendChild(segmentDiv);
    });

    loadAd(0);
}

function loadAd(index) {
    clearInterval(progressInterval);

    if (activeVideo) {
        activeVideo.pause();
        activeVideo.currentTime = 0;
        activeVideo = null;
    }

    currentIndex = index;
    const currentAd = ads[currentIndex];

    // Renderizar directamente el contenido multimedia activo (imagen o video)
    if (currentAd.type === 'image') {
        slidesContainer.innerHTML = `
            <div class="ad-slide absolute inset-0 w-full h-full flex items-center justify-center active">
                <img src="${currentAd.url}" alt="${currentAd.title}" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none"></div>
            </div>
        `;
        toggleMuteBtn.classList.add('hidden');
        startImageTimer(currentAd.duration || 5000);
    } else if (currentAd.type === 'video') {
        slidesContainer.innerHTML = `
            <div class="ad-slide absolute inset-0 w-full h-full flex items-center justify-center active">
                <video id="activeVideoElement" class="w-full h-full object-cover" playsinline muted preload="auto" crossorigin="anonymous">
                    <source src="${currentAd.url}" type="video/mp4">
                </video>
                <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none"></div>
            </div>
        `;
        toggleMuteBtn.classList.remove('hidden');
        activeVideo = document.getElementById('activeVideoElement');
        if (activeVideo) {
            activeVideo.muted = isMuted;
            activeVideo.play().catch(() => {
                activeVideo.muted = true;
                activeVideo.play();
            });
            activeVideo.onended = () => nextAd();
            startVideoProgressTracker();
        } else {
            nextAd();
        }
    }

    // Actualizar estados visuales de las barras de progreso superiores
    ads.forEach((_, idx) => {
        const fill = document.getElementById(`prog-fill-${idx}`);
        if (fill) {
            if (idx < currentIndex) fill.style.width = '100%';
            else if (idx > currentIndex) fill.style.width = '0%';
        }
    });

    // Actualizar textos y enlaces de WhatsApp
    adCounter.innerText = `${currentIndex + 1} de ${ads.length}`;
    adCategory.innerText = currentAd.category;
    adTitle.innerText = currentAd.title;
    adDescription.innerText = currentAd.description;

    const encodedText = encodeURIComponent(currentAd.whatsappText);
    whatsappCta.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`;
}

function startImageTimer(durationMs) {
    currentProgress = 0;
    const fill = document.getElementById(`prog-fill-${currentIndex}`);
    const updateInterval = 50; 
    const step = (updateInterval / durationMs) * 100;

    progressInterval = setInterval(() => {
        if (!isPaused) {
            currentProgress += step;
            if (fill) fill.style.width = `${Math.min(currentProgress, 100)}%`;

            if (currentProgress >= 100) {
                clearInterval(progressInterval);
                nextAd();
            }
        }
    }, updateInterval);
}

function startVideoProgressTracker() {
    const fill = document.getElementById(`prog-fill-${currentIndex}`);
    progressInterval = setInterval(() => {
        if (activeVideo && activeVideo.duration && !isPaused) {
            const pct = (activeVideo.currentTime / activeVideo.duration) * 100;
            if (fill) fill.style.width = `${pct}%`;
        }
    }, 100);
}

function nextAd() {
    const nextIdx = (currentIndex + 1) % ads.length;
    loadAd(nextIdx);
}

function prevAd() {
    const prevIdx = (currentIndex - 1 + ads.length) % ads.length;
    loadAd(prevIdx);
}

function togglePlayPause() {
    isPaused = !isPaused;
    if (isPaused) {
        playIcon.className = 'fa-solid fa-play text-xs';
        pauseIndicator.classList.remove('opacity-0');
        if (activeVideo) activeVideo.pause();
    } else {
        playIcon.className = 'fa-solid fa-pause text-xs';
        pauseIndicator.classList.add('opacity-0');
        if (activeVideo) activeVideo.play();
    }
}

// Event Listeners de control
document.getElementById('prevBtn').addEventListener('click', prevAd);
document.getElementById('nextBtn').addEventListener('click', nextAd);
togglePlayBtn.addEventListener('click', togglePlayPause);

toggleMuteBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    if (activeVideo) activeVideo.muted = isMuted;
    muteIcon.className = isMuted ? 'fa-solid fa-volume-xmark text-xs' : 'fa-solid fa-volume-high text-xs';
});

document.getElementById('tapLeft').addEventListener('click', prevAd);
document.getElementById('tapRight').addEventListener('click', nextAd);
document.getElementById('tapCenter').addEventListener('click', togglePlayPause);

infoBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href);
    const toast = document.getElementById('toast');
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 2000);
});

window.onload = initGallery;