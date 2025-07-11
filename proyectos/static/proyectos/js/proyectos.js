document.addEventListener('DOMContentLoaded', function() {
    
    // Filtros de proyectos
    const filtros = document.querySelectorAll('.filtro-btn');
    const proyectos = document.querySelectorAll('.proyecto-item');
    
    filtros.forEach(filtro => {
        filtro.addEventListener('click', function() {
            const categoria = this.getAttribute('data-filter');
            
            // Actualizar botón activo
            filtros.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filtrar proyectos
            proyectos.forEach(proyecto => {
                const proyectoCategoria = proyecto.getAttribute('data-category');
                
                if (categoria === 'all' || proyectoCategoria === categoria) {
                    proyecto.style.display = 'block';
                    setTimeout(() => {
                        proyecto.style.opacity = '1';
                        proyecto.style.transform = 'translateY(0)';
                    }, 100);
                } else {
                    proyecto.style.opacity = '0';
                    proyecto.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        proyecto.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
    
    // Animación de entrada para las tarjetas
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observar elementos para animación
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
    
    // Inicializar estilos de proyectos para animación
    proyectos.forEach((proyecto, index) => {
        proyecto.style.opacity = '0';
        proyecto.style.transform = 'translateY(30px)';
        proyecto.style.transition = `all 0.6s ease ${index * 0.1}s`;
        
        // Observar para animación de entrada
        observer.observe(proyecto);
    });
    
    // Efecto hover en las tarjetas
    const proyectoCards = document.querySelectorAll('.proyecto-card');
    proyectoCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Smooth scroll para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const isMobile = window.innerWidth <= 768;
                const offset = isMobile ? 100 : 80;
                const targetPosition = target.offsetTop - offset;
                
                window.scrollTo({
                    top: Math.max(0, targetPosition),
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Animación de los badges de tecnología
    const techBadges = document.querySelectorAll('.tech-badge');
    techBadges.forEach((badge, index) => {
        badge.style.animationDelay = `${index * 0.1}s`;
        badge.classList.add('animate-badge');
    });
    
    // Lazy loading para imágenes
    const imagenes = document.querySelectorAll('.proyecto-image img');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });
    
    imagenes.forEach(img => {
        imageObserver.observe(img);
    });
        
});