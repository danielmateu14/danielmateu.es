document.addEventListener('DOMContentLoaded', function() {
    
    // Inicializar partículas con delay aleatorio
    const particles = document.querySelectorAll('.particle');
    particles.forEach((particle, index) => {
        particle.style.animationDelay = Math.random() * 20 + 's';
    });
    
    // Efecto de escritura para el título principal
    const nameSpan = document.getElementById('name-span');
    if (nameSpan) {
        const nameText = "Daniel Mateu";
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
    
    // Posición de scroll donde la sección de proyectos queda ENSAMBLADA y
    // cuadrada (zona de settle del efecto pinned). Devuelve null si el efecto
    // no está activo (móvil / reduce-motion / sin JS del pin) para usar el
    // scroll normal en esos casos.
    function getProyectosFramedScroll() {
        const section = document.querySelector('.proyectos-section');
        const wrapper = section && section.querySelector('.proyectos-scroll');
        if (!wrapper || !section.classList.contains('reveal-active')) return null;
        if (window.innerWidth <= 768) return null;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
        const vh = window.innerHeight || document.documentElement.clientHeight;
        const total = wrapper.offsetHeight - vh;
        if (total <= 0) return null;
        const lead = vh * 0.35;   // debe coincidir con computeTarget() del pin
        const targetP = 0.72;     // ensamblado + un poco de settle (bien cuadrado)
        const wrapperAbsTop = wrapper.getBoundingClientRect().top + window.pageYOffset;
        return Math.max(0, wrapperAbsTop - lead + targetP * (total + lead));
    }

    // Scroll suave: usa Lenis (inercia) si está disponible; si no, nativo.
    function smoothScrollTo(y) {
        y = Math.max(0, y);
        if (window.lenis) {
            window.lenis.scrollTo(y, { duration: 0.9 });
        } else {
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    }

    // Smooth scroll para botones
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');

            // "Proyectos": auto-scroll que termina en la posición ensamblada.
            if (targetId === '#proyectos') {
                const framed = getProyectosFramedScroll();
                if (framed !== null) {
                    smoothScrollTo(framed);
                    return;
                }
            }

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                smoothScrollTo(offsetPosition);
            }
        });
    });

    // Si se llega a la home con #proyectos (p.ej. desde otra página),
    // lleva suavemente a la posición ensamblada en vez de al inicio del efecto.
    if (window.location.hash === '#proyectos') {
        setTimeout(function () {
            const framed = getProyectosFramedScroll();
            if (framed !== null) smoothScrollTo(framed);
        }, 350);
    }
    
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

    // ============================================================
    // Descarga la escena 3D (Spline) del hero cuando no está visible:
    // el runtime de Spline renderiza a cada frame aunque esté fuera de
    // pantalla, así que ocultarlo libera GPU y suaviza el scroll del resto
    // de la página. Se vuelve a mostrar al regresar al inicio.
    // ============================================================
    (function offscreenSpline() {
        const hero = document.querySelector('.hero-section');
        const bg = document.querySelector('.hero-3d-bg');
        if (!hero || !bg || !('IntersectionObserver' in window)) return;

        const obs = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                // visibility:hidden (no display:none): mantiene el tamaño del canvas
                // para que el runtime de Spline no falle con framebuffer 0x0 (errores WebGL),
                // pero deja de pintarse cuando el hero no está en pantalla.
                bg.style.visibility = entry.isIntersecting ? '' : 'hidden';
            });
        }, { rootMargin: '100px' }); // pequeño margen para que no parpadee al borde

        obs.observe(hero);
    })();

    // ============================================================
    // Que el robot siga el dedo/ratón por TODO el hero.
    //
    // En móvil la escena se escala (--robot-escala) para que el robot no salga
    // gigante, y `transform: scale()` encoge también la CAJA del elemento, no
    // solo lo que se pinta. El canvas deja de estar debajo del texto y de la
    // foto, así que Spline no recibe el puntero ahí y la cabeza se queda quieta.
    //
    // No se arregla con CSS: en Spline el tamaño del robot es proporcional a la
    // altura del canvas, así que agrandarlo para cubrir el hero lo devuelve a su
    // tamaño original. Lo que hacemos es reenviar el evento al canvas.
    // ============================================================
    (function splineSigueElPuntero() {
        const hero = document.querySelector('.hero-section');
        const bg = document.querySelector('.hero-3d-bg');
        const viewer = bg && bg.querySelector('spline-viewer');
        if (!hero || !viewer || !window.PointerEvent) return;

        let destino = null;

        // El canvas vive en el shadow DOM del componente y no existe hasta que
        // Spline termina de montar la escena.
        (function esperarCanvas(intentos) {
            destino = viewer.shadowRoot && viewer.shadowRoot.querySelector('canvas');
            if (!destino && intentos > 0) setTimeout(() => esperarCanvas(intentos - 1), 250);
        })(40); // ~10 s de margen; si no aparece, no se reenvía nada y no pasa nada

        // pointermove cubre el ratón y el arrastre del dedo; pointerdown, el
        // toque suelto, que en móvil puede no llegar a generar ningún move.
        ['pointermove', 'pointerdown'].forEach((tipo) => {
            hero.addEventListener(tipo, (e) => {
                if (!destino) return;
                // En escritorio el canvas ocupa el hero entero y ya recibe el
                // evento directamente (el .container es pointer-events:none).
                // Reenviarlo seria duplicarlo.
                if (e.target === viewer || viewer.contains(e.target)) return;

                destino.dispatchEvent(new PointerEvent(tipo, {
                    clientX: e.clientX,
                    clientY: e.clientY,
                    pointerId: e.pointerId,
                    pointerType: e.pointerType,
                    isPrimary: e.isPrimary,
                    buttons: e.buttons,
                    bubbles: false,      // que no vuelva a subir hasta el hero
                    cancelable: false,
                }));
            }, { passive: true });
        });
    })();

    // ============================================================
    // Sección "Mis Proyectos" — efecto PINNED scrollytelling.
    // Mientras .proyectos-pin está pegado (sticky), medimos el progreso
    // (0 → 1) del recorrido y, por RENDIMIENTO, escribimos las transforms
    // INLINE solo en los elementos que se mueven (tarjetas, título, botón
    // y resplandor). Así NO invalidamos el estilo de todo el subárbol en
    // cada frame (que era lo que producía los tirones).
    // ============================================================
    (function initProyectosReveal() {
        const section = document.querySelector('.proyectos-section');
        const wrapper = section && section.querySelector('.proyectos-scroll');
        if (!section || !wrapper) return;

        section.classList.add('reveal-active');

        const cards = Array.prototype.slice.call(section.querySelectorAll('.reveal-card'));
        const header = section.querySelector('.proy-header');
        const outro = section.querySelector('.proy-outro');
        const extras = [header, outro];

        // Posición/escala de partida de cada tarjeta (collage disperso).
        const cardCfg = [
            { sx: -42, sy: -26, ss: 1.7 },  // vw, vh, escala
            { sx:  44, sy:  30, ss: 1.9 },
            { sx: -34, sy:  36, ss: 1.5 }
        ];
        const clamp01 = (v) => (v < 0 ? 0 : (v > 1 ? 1 : v));

        function applyRest() { // estado ensamblado (sin animación)
            cards.forEach((c) => { c.style.transform = 'translate(0,0) scale(1)'; c.style.opacity = '1'; });
            extras.forEach((el) => { if (el) { el.style.opacity = '1'; el.style.transform = 'none'; } });
        }
        function clearInline() { // deja que mande el CSS (móvil)
            cards.forEach((c) => { c.style.transform = ''; c.style.opacity = ''; });
            extras.forEach((el) => { if (el) { el.style.opacity = ''; el.style.transform = ''; } });
        }

        // Respeta la preferencia del usuario: sin animación, todo ensamblado.
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            applyRest();
            return;
        }

        // Escala el bloque para que SIEMPRE quepa en la altura disponible
        // del escenario pinned (alto pantalla − navbar), sin recortes.
        const pin = section.querySelector('.proyectos-pin');
        const container = pin && pin.querySelector('.container');
        function updateFit() {
            if (!pin || !container) return;
            const cs = getComputedStyle(pin);
            const padding = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
            const avail = pin.clientHeight - padding - 10;
            const natural = container.scrollHeight;
            let fit = natural > 0 ? avail / natural : 1;
            fit = Math.min(1, Math.max(0.9, fit));
            section.style.setProperty('--fit', fit.toFixed(4));
        }

        // Aplica un frame del efecto a partir del progreso p (0 → 1).
        function applyFrame(p) {
            if (window.innerWidth <= 768) { clearInline(); return; } // móvil: layout normal
            const vw = window.innerWidth, vh = window.innerHeight;
            for (let i = 0; i < cards.length; i++) {
                const c = cardCfg[i] || { sx: 0, sy: 0, ss: 1 };
                const cp = clamp01((p - i * 0.11) * 2.6);   // arranque escalonado por índice
                const inv = 1 - cp;
                const tx = (c.sx / 100 * vw) * inv;
                const ty = (c.sy / 100 * vh) * inv;
                const sc = 1 + (c.ss - 1) * inv;
                cards[i].style.transform = 'translate(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px) scale(' + sc.toFixed(3) + ')';
                cards[i].style.opacity = clamp01(cp * 1.4).toFixed(3);
            }
            const op = clamp01((p - 0.42) * 5.5);          // título + botón al final
            const ety = ((1 - op) * 30).toFixed(1);
            extras.forEach((el) => {
                if (!el) return;
                el.style.opacity = op.toFixed(3);
                el.style.transform = 'translateY(' + ety + 'px)';
            });
        }

        // Progreso objetivo. El "lead" hace que el montaje empiece un poco
        // antes de que la sección quede pegada (mientras aún está entrando).
        let cachedTotal = 0;
        function computeTarget() {
            const vh = window.innerHeight || document.documentElement.clientHeight;
            const total = cachedTotal;                 // alto cacheado (se recalcula en resize)
            if (total <= 0) return 0;
            const lead = vh * 0.35;
            const top = wrapper.getBoundingClientRect().top;
            const p = (lead - top) / (total + lead);
            return Math.min(1, Math.max(0, p));
        }

        let target = 0, current = 0, rafId = null;
        const hasLenis = !!window.lenis;

        function loop() { // fallback sin Lenis: suaviza con lerp
            current += (target - current) * 0.16;
            if (Math.abs(target - current) < 0.0004) current = target;
            applyFrame(current);
            rafId = (current === target) ? null : requestAnimationFrame(loop);
        }
        function onRevealScroll() {
            target = computeTarget();
            if (hasLenis) { current = target; applyFrame(current); }   // Lenis ya suaviza
            else if (rafId === null) rafId = requestAnimationFrame(loop);
        }
        function onResize() {
            cachedTotal = wrapper.offsetHeight - (window.innerHeight || document.documentElement.clientHeight);
            updateFit();
            onRevealScroll();
        }

        // Init
        cachedTotal = wrapper.offsetHeight - (window.innerHeight || document.documentElement.clientHeight);
        updateFit();
        if (hasLenis) window.lenis.on('scroll', onRevealScroll);
        window.addEventListener('scroll', onRevealScroll, { passive: true });
        window.addEventListener('resize', onResize, { passive: true });
        window.addEventListener('load', onResize);
        target = current = computeTarget();
        applyFrame(current);
    })();
});