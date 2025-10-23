document.addEventListener('DOMContentLoaded', function() {
    
    // Inicializar partículas con delay aleatorio
    const particles = document.querySelectorAll('.particle');
    particles.forEach((particle, index) => {
        particle.style.animationDelay = Math.random() * 20 + 's';
    });
    
    // Efecto de escritura para el título principal
    const nameSpan = document.getElementById('name-span');
    if (nameSpan) {
        const nameText = "Daniel Mateu Sánchez";
        let i = 0;

        // Iniciar el efecto de escritura inmediatamente
        const typeInterval = setInterval(() => {
            if (i < nameText.length) {
                nameSpan.textContent = nameText.substring(0, i + 1) + '|';
                i++;
            } else {
                clearInterval(typeInterval);
                // Quitar el cursor después de terminar
                setTimeout(() => {
                    nameSpan.textContent = nameText;
                }, 500);
            }
        }, 100);
    }
    
    // Smooth scroll para botones
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const isMobile = window.innerWidth <= 768;
                const headerOffset = isMobile ? 80 : 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: Math.max(0, offsetPosition),
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Animación de las tecnologías en el hero con delay escalonado
    const techBadges = document.querySelectorAll('.tech-badge');
    techBadges.forEach((badge, index) => {
        badge.style.animationDelay = `${0.8 + index * 0.1}s`;
        badge.classList.add('animate-fadeInUp');
    });
    
    // Animación para los badges de tecnologías en la sección sobre mí
    const aboutTechBadges = document.querySelectorAll('.tech-badges .badge');
    
    // Observador para animar los badges cuando entren en vista
    const badgeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const badges = entry.target.querySelectorAll('.badge');
                badges.forEach((badge, index) => {
                    badge.style.opacity = '0';
                    badge.style.transform = 'translateY(20px)';
                    badge.style.transition = `all 0.4s ease ${index * 0.1}s`;
                    
                    setTimeout(() => {
                        badge.style.opacity = '1';
                        badge.style.transform = 'translateY(0)';
                    }, index * 100);
                });
                badgeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    const techStackSection = document.querySelector('.tech-stack');
    if (techStackSection) {
        badgeObserver.observe(techStackSection);
    }

    // Observador para timeline items
    const timelineItems = document.querySelectorAll('.timeline-content');
    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
            }
        });
    }, { threshold: 0.3 });
    
    timelineItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-30px)';
        item.style.transition = `all 0.6s ease ${index * 0.2}s`;
        timelineObserver.observe(item);
    });
    
    // Efecto hover mejorado en las tarjetas de proyecto
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
            this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.25)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
        });
    });
    
    // Efecto de aparición suave para elementos al hacer scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Aplicar animación a elementos con clase animate-on-scroll
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        fadeInObserver.observe(el);
    });
    
    // Efecto parallax sutil para el hero
    let ticking = false;
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.floating-icon');
        
        parallaxElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.1);
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);
    
    // Efecto de carga inicial mejorado para el hero
    setTimeout(() => {
        const heroContent = document.querySelector('.hero-content');
        const heroImage = document.querySelector('.hero-image');
        
        if (heroContent) {
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }
        
        if (heroImage) {
            heroImage.style.opacity = '1';
            heroImage.style.transform = 'translateY(0)';
        }
    }, 300);
    
    // Efecto de hover en los iconos flotantes
    const floatingIcons = document.querySelectorAll('.floating-icon');
    floatingIcons.forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.2) rotate(15deg)';
            this.style.background = 'rgba(255, 255, 255, 0.3)';
        });
        
        icon.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
            this.style.background = 'rgba(255, 255, 255, 0.15)';
        });
    });
    
    // Efecto de pulso en los botones del hero
    const heroButtons = document.querySelectorAll('.btn-custom-primary, .btn-custom-secondary');
    heroButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.animation = 'pulse 1s ease-in-out infinite';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.animation = 'none';
        });
    });
    
    // Animación de entrada escalonada para las tarjetas de contacto
    const contactItems = document.querySelectorAll('.contact-item');
    const contactObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 200);
                contactObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    contactItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'all 0.6s ease';
        contactObserver.observe(item);
    });
    
    // Efecto de brillo en los tech badges al hacer hover
    document.querySelectorAll('.tech-badge').forEach(badge => {
        badge.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.5)';
            this.style.transform = 'translateY(-3px) scale(1.05)';
        });
        
        badge.addEventListener('mouseleave', function() {
            this.style.boxShadow = 'none';
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Efecto de ondas en los botones (ripple effect)
    function createRipple(event) {
        const button = event.currentTarget;
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
        circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
        circle.classList.add('ripple');
        
        const ripple = button.getElementsByClassName('ripple')[0];
        if (ripple) {
            ripple.remove();
        }
        
        button.appendChild(circle);
    }
    
    // Aplicar efecto ripple a botones
    heroButtons.forEach(button => {
        button.addEventListener('click', createRipple);
    });
    
    // CSS para el efecto ripple
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        .btn-custom-primary, .btn-custom-secondary {
            position: relative;
            overflow: hidden;
        }
        
        .ripple {
            position: absolute;
            border-radius: 50%;
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            background-color: rgba(255, 255, 255, 0.3);
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        @keyframes pulse-glow {
            0%, 100% {
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            }
            50% {
                box-shadow: 0 4px 25px rgba(139, 92, 246, 0.4);
            }
        }
    `;
    document.head.appendChild(rippleStyle);
    
    // Mejorar rendimiento pausando animaciones cuando no están visibles
    const intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
            } else {
                entry.target.style.animationPlayState = 'paused';
            }
        });
    });
    
    // Observar elementos animados para optimizar rendimiento
    document.querySelectorAll('.particle, .floating-icon').forEach(element => {
        intersectionObserver.observe(element);
    });
});