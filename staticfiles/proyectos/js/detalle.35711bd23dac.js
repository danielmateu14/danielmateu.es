// ===== DETALLE.JS =====

document.addEventListener('DOMContentLoaded', function() {
    
    // FUNCIONALIDAD: Animación especial para el placeholder de imagen
    const placeholderDetalle = document.querySelector('.proyecto-placeholder-detalle');
    if (placeholderDetalle) {
        createFloatingParticles(placeholderDetalle);
        
        const icon = placeholderDetalle.querySelector('i');
        if (icon) {
            setInterval(() => {
                icon.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    icon.style.transform = 'scale(1)';
                }, 500);
            }, 3000);
        }
    }
    
    // FUNCIONALIDAD: Mejorar la animación del breadcrumb
    const breadcrumbLink = document.querySelector('.breadcrumb-link');
    if (breadcrumbLink) {
        breadcrumbLink.addEventListener('click', function(e) {
            createRippleEffect(e, this);
        });
    }
    
    // FUNCIONALIDAD: Animación escalonada para los highlights modernos
    const highlightModernos = document.querySelectorAll('.highlight-moderno');
    if (highlightModernos.length > 0) {
        const highlightObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const items = document.querySelectorAll('.highlight-moderno');
                    items.forEach((item, index) => {
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        }, index * 200);
                    });
                    highlightObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        
        highlightModernos.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px)';
            item.style.transition = 'all 0.6s ease';
        });
        
        const highlightsContainer = document.querySelector('.highlights-modernos');
        if (highlightsContainer) {
            highlightObserver.observe(highlightsContainer);
        }
    }
    
    // FUNCIONALIDAD: Animación de aparición general
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
    
    // FUNCIONALIDAD PRINCIPAL: Slideshow de imágenes
    let slideIndex = 1;
    let autoPlayInterval;
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    if (slides.length > 0) {
        showSlide(slideIndex);
        
        // Auto-play del slideshow solo si hay múltiples slides
        if (slides.length > 1) {
            startAutoPlay();
        }
    }
    
    // Funciones del slideshow
    window.changeSlide = function(n) {
        pauseAutoPlay();
        slideIndex += n;
        if (slideIndex > slides.length) { slideIndex = 1; }
        if (slideIndex < 1) { slideIndex = slides.length; }
        showSlide(slideIndex);
        startAutoPlay();
    }
    
    window.currentSlide = function(n) {
        pauseAutoPlay();
        slideIndex = n;
        showSlide(slideIndex);
        startAutoPlay();
    }
    
    function showSlide(n) {
        if (slides.length === 0) return;
        
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        if (slides[n-1]) {
            slides[n-1].classList.add('active');
        }
        if (dots[n-1]) {
            dots[n-1].classList.add('active');
        }
    }
    
    function startAutoPlay() {
        if (slides.length > 1) {
            autoPlayInterval = setInterval(() => {
                slideIndex++;
                if (slideIndex > slides.length) { slideIndex = 1; }
                showSlide(slideIndex);
            }, 5000);
        }
    }
    
    function pauseAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
        }
    }
    
    // Control por teclado del slideshow
    document.addEventListener('keydown', function(e) {
        if (slides.length > 1) {
            if (e.key === 'ArrowLeft') {
                changeSlide(-1);
            } else if (e.key === 'ArrowRight') {
                changeSlide(1);
            }
        }
    });
    
    // Pausar auto-play cuando el usuario interactúa
    const slideContainer = document.querySelector('.slideshow-container');
    if (slideContainer) {
        slideContainer.addEventListener('mouseenter', pauseAutoPlay);
        slideContainer.addEventListener('mouseleave', startAutoPlay);
        
        // Touch events para móviles
        let touchStartX = 0;
        let touchEndX = 0;
        
        slideContainer.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
            pauseAutoPlay();
        });
        
        slideContainer.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
            startAutoPlay();
        });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    changeSlide(1); // Swipe left - next slide
                } else {
                    changeSlide(-1); // Swipe right - previous slide
                }
            }
        }
    }
    
    // FUNCIONALIDAD: Parallax suave para la descripción
    function updateDescriptionParallax() {
        const scrolled = window.pageYOffset;
        const descriptionSection = document.querySelector('.sobre-proyecto-nueva');
        
        if (descriptionSection) {
            const rect = descriptionSection.getBoundingClientRect();
            const inView = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (inView) {
                const speed = 0.02; // Muy sutil
                const yPos = scrolled * speed;
                const contenido = descriptionSection.querySelector('.contenido-principal-amplio');
                if (contenido) {
                    contenido.style.transform = `translateY(${-yPos}px)`;
                }
            }
        }
    }
    
    // FUNCIONALIDAD: Lazy loading para imágenes del slideshow
    const slideObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target.querySelector('img');
                if (img && img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                slideObserver.unobserve(entry.target);
            }
        });
    });

    document.querySelectorAll('.slide').forEach(slide => {
        slideObserver.observe(slide);
    });
    
    // FUNCIONALIDAD: Smooth scroll para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // FUNCIONALIDAD: Preloader suave para imágenes
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (!img.complete) {
            img.style.opacity = '0';
            img.addEventListener('load', function() {
                this.style.transition = 'opacity 0.5s ease';
                this.style.opacity = '1';
            });
        }
    });
    
    // FUNCIONALIDAD: Control de velocidad de animaciones según el dispositivo
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        document.documentElement.style.setProperty('--animation-speed', '0.8s');
    }
    
    // Throttle para el scroll
    let ticking = false;
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateDescriptionParallax();
                ticking = false;
            });
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);
    
    // FUNCIONALIDAD: Detección de scroll para navbar (si existe)
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const header = document.querySelector('.navbar');
        
        if (header) {
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
        }
        lastScrollTop = scrollTop;
    });
    
    // FUNCIONALIDAD: Intersection Observer para slideshow placeholder
    const slideshowPlaceholder = document.querySelector('.slideshow-placeholder');
    if (slideshowPlaceholder) {
        const placeholderObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                } else {
                    entry.target.style.animationPlayState = 'paused';
                }
            });
        });
        
        placeholderObserver.observe(slideshowPlaceholder);
    }
});

// FUNCIONES DE UTILIDAD

function createFloatingParticles(container) {
    const particleCount = 6;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: linear-gradient(135deg, #8b5cf6, #06b6d4);
            border-radius: 50%;
            opacity: 0.6;
            pointer-events: none;
            animation: float-particle ${3 + Math.random() * 2}s ease-in-out infinite;
            animation-delay: ${Math.random() * 2}s;
            left: ${20 + Math.random() * 60}%;
            top: ${20 + Math.random() * 60}%;
        `;
        container.appendChild(particle);
    }
}

function createRippleEffect(event, element) {
    const rect = element.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
        z-index: 0;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// FUNCIONALIDAD: Gestión de tema oscuro/claro (opcional)
function toggleTheme() {
    const body = document.body;
    const isDark = body.classList.contains('dark-theme');
    
    if (isDark) {
        body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
    }
}

// Aplicar tema guardado
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
}

// CSS ADICIONAL PARA LAS FUNCIONALIDADES
const additionalStyles = `
    @keyframes float-particle {
        0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.6;
        }
        50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 1;
        }
    }
    
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .proyecto-placeholder-detalle {
        position: relative;
        overflow: hidden;
    }
    
    .floating-particle {
        z-index: 1;
    }
    
    .breadcrumb-link {
        position: relative;
        overflow: hidden;
        z-index: 1;
    }
    
    .highlight-moderno,
    .slide {
        will-change: transform, opacity;
    }
    
    .animate-on-scroll {
        transition: all 0.8s ease;
    }

    .animate-on-scroll.visible {
        opacity: 1;
        transform: translateY(0);
    }
    
    .slideshow-controls {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .navbar {
        transition: transform 0.3s ease;
    }
    
    /* Optimización para móviles */
    @media (max-width: 768px) {
        .floating-particle {
            animation-duration: 4s;
        }
        
        .animate-on-scroll {
            transition-duration: 0.6s;
        }
    }
    
    /* Reducir movimiento para usuarios con preferencias de accesibilidad */
    @media (prefers-reduced-motion: reduce) {
        .animate-on-scroll,
        .highlight-moderno,
        .slide {
            transition: none !important;
            animation: none !important;
        }
        
        .floating-particle {
            display: none;
        }
    }
    
    /* Dark theme styles */
    .dark-theme {
        --primary-bg: #1a1a1a;
        --secondary-bg: #2d2d2d;
        --text-primary: #ffffff;
        --text-secondary: #cccccc;
    }
    
    .dark-theme .sobre-proyecto-nueva {
        background: linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%);
    }
    
    .dark-theme .titulo-principal-nuevo,
    .dark-theme .descripcion-amplia h3 {
        color: var(--text-primary);
    }
    
    .dark-theme .descripcion-texto,
    .dark-theme .caracteristicas-lista li {
        color: var(--text-secondary);
    }
    
    /* Mejoras para el slideshow */
    .slideshow-container {
        touch-action: pan-y;
    }
    
    .slide img {
        user-select: none;
        -webkit-user-drag: none;
    }
`;

// Agregar los estilos adicionales
const additionalStyleSheet = document.createElement('style');
additionalStyleSheet.textContent = additionalStyles;
document.head.appendChild(additionalStyleSheet);

// Performance monitoring (opcional)
if ('PerformanceObserver' in window) {
    const perfObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.entryType === 'measure') {
                console.log(`⚡ ${entry.name}: ${entry.duration.toFixed(2)}ms`);
            }
        }
    });
    
    perfObserver.observe({ entryTypes: ['measure'] });
}

// Marcar el rendimiento
performance.mark('detalle-start');

window.addEventListener('load', () => {
    performance.mark('detalle-end');
    performance.measure('detalle-total', 'detalle-start', 'detalle-end');
});