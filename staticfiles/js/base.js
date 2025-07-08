// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    
    // Navbar scroll effect con transparencia
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            // Al hacer scroll hacia abajo - navbar con transparencia
            navbar.classList.add('navbar-scrolled');
            navbar.classList.remove('navbar-top');
        } else {
            // En la parte superior - navbar sólido
            navbar.classList.remove('navbar-scrolled');
            navbar.classList.add('navbar-top');
        }
    });
    
    // Inicializar navbar en la parte superior
    if (window.scrollY <= 50) {
        navbar.classList.add('navbar-top');
    }
    
    // Smooth scroll para enlaces internos con compensación mejorada
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                // Calcular offset para compensar el navbar fijo
                const navbarHeight = navbar ? navbar.offsetHeight : 76;
                const targetPosition = target.offsetTop - navbarHeight + 10; // +10 para un poco más de espacio
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Animación de entrada para elementos
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observar elementos con clase 'animate-on-scroll'
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
    
    // Animación para timeline items
    document.querySelectorAll('.timeline-item').forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-30px)';
        item.style.transition = `all 0.6s ease ${index * 0.2}s`;
        observer.observe(item);
    });
    
    // Cerrar navbar en móvil al hacer click en un enlace
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (navbarCollapse.classList.contains('show')) {
                navbarToggler.click();
            }
        });
    });
    
    // Destacar enlace activo del navbar según la sección visible
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let current = '';
        
        // Verificar si estamos cerca del final de la página (últimos 200px)
        const isNearBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200;
        
        if (isNearBottom) {
            // Si estamos cerca del final, marcar contacto como activo
            current = 'contacto';
        } else {
            // Lógica normal para otras secciones
            sections.forEach(section => {
                const sectionTop = section.offsetTop - navbar.offsetHeight - 100;
                const sectionHeight = section.offsetHeight;
                
                if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                    current = section.getAttribute('id');
                }
            });
        }
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }
    
    // Ejecutar al hacer scroll
    window.addEventListener('scroll', updateActiveNavLink);
    
    // Typing effect para textos
    function typeWriter(element, text, speed = 100) {
        let i = 0;
        element.innerHTML = '';
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        
        type();
    }
    
    // Función para mostrar alertas personalizadas
    function showAlert(message, type = 'success') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.top = '90px';
        alertDiv.style.right = '20px';
        alertDiv.style.zIndex = '9999';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
    
    // Función para validar formularios
    function validateForm(form) {
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('is-invalid');
                isValid = false;
            } else {
                input.classList.remove('is-invalid');
                input.classList.add('is-valid');
            }
        });
        
        return isValid;
    }
    
    // Función para mostrar loading
    function showLoading(element) {
        const originalContent = element.innerHTML;
        element.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Cargando...';
        element.disabled = true;
        
        return function hideLoading() {
            element.innerHTML = originalContent;
            element.disabled = false;
        };
    }
    
    // Animación suave para los badges de tecnologías
    function animateTechBadges() {
        const badges = document.querySelectorAll('.tech-badges .badge');
        badges.forEach((badge, index) => {
            badge.style.opacity = '0';
            badge.style.transform = 'translateY(20px)';
            badge.style.transition = `all 0.4s ease ${index * 0.1}s`;
            
            // Mostrar cuando la sección esté visible
            observer.observe(badge);
        });
    }
    
    // Ejecutar animación de badges
    setTimeout(animateTechBadges, 1000);
    
    // Efecto parallax suave para imágenes
    function parallaxEffect() {
        const parallaxElements = document.querySelectorAll('.about-image img');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.1;
            
            parallaxElements.forEach(element => {
                element.style.transform = `translateY(${rate}px)`;
            });
        });
    }
    
    // Inicializar parallax
    parallaxEffect();
    
    // Hacer funciones disponibles globalmente
    window.DanielPortfolio = {
        typeWriter,
        showAlert,
        validateForm,
        showLoading,
        updateActiveNavLink
    };
    
    // Preloader (si existe)
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.remove();
            }, 500);
        });
    }
    
    console.log('🚀 Portfolio de Daniel Mateu Sánchez cargado correctamente');
});