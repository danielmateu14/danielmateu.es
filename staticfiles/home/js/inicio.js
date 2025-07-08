// Página de inicio
document.addEventListener('DOMContentLoaded', function() {
    
    // Efecto de escritura para el título principal
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = 'Hola, soy <span style="color: #06b6d4;">Daniel Mateu Sánchez</span>';
        const nameText = "Daniel Mateu Sánchez";
        const beforeName = "Hola, soy ";
        
        // Función para crear efecto de typing
        function typeText() {
            heroTitle.innerHTML = beforeName + '<span style="color: #06b6d4;" class="typing-cursor"></span>';
            
            let i = 0;
            const typeInterval = setInterval(() => {
                if (i < nameText.length) {
                    const currentText = beforeName + '<span style="color: #06b6d4;">' + nameText.substring(0, i + 1) + '<span class="typing-cursor">|</span></span>';
                    heroTitle.innerHTML = currentText;
                    i++;
                } else {
                    clearInterval(typeInterval);
                    setTimeout(() => {
                        heroTitle.innerHTML = originalText;
                    }, 2000);
                }
            }, 100);
        }
        
        // Iniciar el efecto después de 1 segundo
        setTimeout(typeText, 1000);
    }
    
    // Smooth scroll mejorado para botones
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Efecto parallax en el hero
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroSection = document.querySelector('.hero-section');
        
        if (heroSection && scrolled <= window.innerHeight) {
            const rate = scrolled * -0.3; // Reducido para un efecto más sutil
            heroSection.style.transform = `translateY(${rate}px)`;
        }
    });
    
    // Animación de las tecnologías en el hero
    const techBadges = document.querySelectorAll('.tech-badge');
    techBadges.forEach((badge, index) => {
        badge.style.animationDelay = `${index * 0.1}s`;
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
    
    // Efecto hover en las tarjetas de proyecto
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
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
    
    // Efecto de carga inicial para el hero
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
});