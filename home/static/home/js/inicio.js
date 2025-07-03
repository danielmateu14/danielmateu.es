// JavaScript específico para la página de inicio
document.addEventListener('DOMContentLoaded', function() {
    
    // Animaciones de las barras de habilidades
    const skillBars = document.querySelectorAll('.skill-progress');
    
    const animateSkillBars = () => {
        skillBars.forEach(bar => {
            const width = bar.getAttribute('data-width');
            setTimeout(() => {
                bar.style.width = width + '%';
            }, Math.random() * 500 + 200);
        });
    };
    
    // Observador para animar las barras cuando entren en vista
    const skillsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateSkillBars();
                skillsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    const skillsSection = document.querySelector('.skills-section');
    if (skillsSection) {
        skillsObserver.observe(skillsSection);
    }
    
    // Efecto de escritura para el título principal
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.innerHTML;
        const nameSpan = heroTitle.querySelector('.text-primary');
        
        if (nameSpan) {
            const nameText = nameSpan.textContent;
            const beforeName = "Hola, soy ";
            
            // Función para crear efecto de typing
            function typeText() {
                heroTitle.innerHTML = beforeName + '<span class="text-primary typing-cursor"></span>';
                
                let i = 0;
                const typeInterval = setInterval(() => {
                    if (i < nameText.length) {
                        const currentText = beforeName + '<span class="text-primary">' + nameText.substring(0, i + 1) + '<span class="typing-cursor">|</span></span>';
                        heroTitle.innerHTML = currentText;
                        i++;
                    } else {
                        clearInterval(typeInterval);
                        // Eliminar cursor después de 2 segundos
                        setTimeout(() => {
                            heroTitle.innerHTML = originalText;
                        }, 2000);
                    }
                }, 100);
            }
            
            // Iniciar el efecto después de 1 segundo
            setTimeout(typeText, 1000);
        }
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
            const rate = scrolled * -0.5;
            heroSection.style.transform = `translateY(${rate}px)`;
        }
    });
    
    // Animación de las tecnologías
    const techBadges = document.querySelectorAll('.tech-badge');
    techBadges.forEach((badge, index) => {
        badge.style.animationDelay = `${index * 0.1}s`;
        badge.classList.add('animate-fadeInUp');
    });
    
    // Contador animado para proyectos (ejemplo)
    const animateCounter = (element, start, end, duration) => {
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const current = Math.floor(progress * (end - start) + start);
            
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    };
    
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
    
    // Funcionalidad para subir foto de perfil
    const imageContainer = document.querySelector('.image-container');
    if (imageContainer) {
        imageContainer.addEventListener('click', function() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            
            input.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        imageContainer.innerHTML = `
                            <img src="${event.target.result}" 
                                 alt="Daniel Mateu Sánchez" 
                                 style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
                        `;
                    };
                    reader.readAsDataURL(file);
                }
            });
            
            input.click();
        });
        
        // Drag and drop para la imagen
        imageContainer.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.borderColor = 'rgba(255, 255, 255, 0.6)';
            this.style.background = 'rgba(255, 255, 255, 0.2)';
        });
        
        imageContainer.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            this.style.background = 'rgba(255, 255, 255, 0.1)';
        });
        
        imageContainer.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            this.style.background = 'rgba(255, 255, 255, 0.1)';
            
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    imageContainer.innerHTML = `
                        <img src="${event.target.result}" 
                             alt="Daniel Mateu Sánchez" 
                             style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
                    `;
                };
                reader.readAsDataURL(files[0]);
            }
        });
    }
    
    // Partículas de fondo (opcional)
    function createParticles() {
        const heroSection = document.querySelector('.hero-section');
        if (!heroSection) return;
        
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                pointer-events: none;
                animation: floatParticle ${Math.random() * 10 + 10}s linear infinite;
                left: ${Math.random() * 100}%;
                animation-delay: ${Math.random() * 10}s;
            `;
            heroSection.appendChild(particle);
        }
    }
    
    // Agregar animación CSS para partículas
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatParticle {
            0% {
                transform: translateY(100vh) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(-100px) rotate(360deg);
                opacity: 0;
            }
        }
        
        .typing-cursor {
            animation: blink 1s infinite;
        }
        
        @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Crear partículas
    createParticles();
    
    // Tooltip personalizado para tecnologías
    techBadges.forEach(badge => {
        badge.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'custom-tooltip';
            tooltip.textContent = `Experiencia con ${this.textContent}`;
            tooltip.style.cssText = `
                position: absolute;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                white-space: nowrap;
                z-index: 1000;
                pointer-events: none;
                transform: translateX(-50%);
                margin-top: -40px;
                left: 50%;
            `;
            this.style.position = 'relative';
            this.appendChild(tooltip);
        });
        
        badge.addEventListener('mouseleave', function() {
            const tooltip = this.querySelector('.custom-tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });
    });
    
    console.log('🎉 Página de inicio de Daniel Mateu cargada correctamente');
});