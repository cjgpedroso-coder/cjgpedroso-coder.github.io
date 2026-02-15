/* ═══════════════════════════════════════════════════════
   PREMIUM DARK RESUME — INTERACTIVE SCRIPTS
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initNavbar();
    initParticles();
    initScrollAnimations();
    initSkillBars();
    initStatCounters();
    initGalleryLightbox();
    initMobileNav();
    initActiveNavLink();
    initProjectCards();
});

/* ═══════════════════════════════════════
   NAVBAR — Scroll Effects
   ═══════════════════════════════════════ */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const sidebar = document.querySelector('.sidebar');
    const hero = document.querySelector('.hero');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Show sidebar after scrolling past hero
        if (sidebar && hero) {
            const heroBottom = hero.offsetTop + hero.offsetHeight;
            if (currentScroll > heroBottom - 200) {
                sidebar.classList.add('sidebar-visible');
            } else {
                sidebar.classList.remove('sidebar-visible');
            }
        }

        lastScroll = currentScroll;
    }, { passive: true });
}

/* ═══════════════════════════════════════
   PARTICLES — Floating Background
   ═══════════════════════════════════════ */
function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    const particleCount = 40;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        const size = Math.random() * 3 + 1;
        const left = Math.random() * 100;
        const duration = Math.random() * 8 + 6;
        const delay = Math.random() * 10;

        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${left}%;
            bottom: -10px;
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
        `;

        container.appendChild(particle);
    }
}

/* ═══════════════════════════════════════
   SCROLL ANIMATIONS — Intersection Observer
   ═══════════════════════════════════════ */
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('[data-aos]').forEach((el) => {
        observer.observe(el);
    });
}

/* ═══════════════════════════════════════
   SKILL BARS — Animated Fill
   ═══════════════════════════════════════ */
function initSkillBars() {
    const skillSection = document.getElementById('habilidades');
    if (!skillSection) return;

    let animated = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting && !animated) {
                animated = true;
                animateSkillBars();
            }
        });
    }, { threshold: 0.2 });

    observer.observe(skillSection);
}

function animateSkillBars() {
    const bars = document.querySelectorAll('.skill-bar-fill');

    bars.forEach((bar, index) => {
        const targetWidth = bar.getAttribute('data-width');
        setTimeout(() => {
            bar.style.width = targetWidth + '%';
            bar.classList.add('animated');
        }, index * 100);
    });
}

/* ═══════════════════════════════════════
   STAT COUNTERS — Animated Numbers
   ═══════════════════════════════════════ */
function initStatCounters() {
    const stats = document.querySelectorAll('.stat-number[data-target]');
    if (!stats.length) return;

    let animated = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting && !animated) {
                animated = true;
                stats.forEach((stat) => animateCounter(stat));
            }
        });
    }, { threshold: 0.3 });

    stats.forEach((stat) => observer.observe(stat));
}

function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'));
    const duration = 2000;
    const start = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);

        el.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = target;
        }
    }

    requestAnimationFrame(update);
}

/* ═══════════════════════════════════════
   GALLERY LIGHTBOX
   ═══════════════════════════════════════ */
function initGalleryLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeBtn = document.querySelector('.lightbox-close');

    if (!lightbox || !lightboxImg) return;

    document.querySelectorAll('.gallery-item').forEach((item) => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });
}

/* ═══════════════════════════════════════
   MOBILE NAVIGATION
   ═══════════════════════════════════════ */
function initMobileNav() {
    const toggle = document.getElementById('navToggle');
    const navLinks = document.querySelector('.nav-links');

    if (!toggle || !navLinks) return;

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            navLinks.classList.remove('open');
        });
    });
}

/* ═══════════════════════════════════════
   ACTIVE NAV LINK — Scroll Spy
   ═══════════════════════════════════════ */
function initActiveNavLink() {
    const sections = document.querySelectorAll('.section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        const scrollPos = window.pageYOffset + 150;

        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }, { passive: true });
}

/* ═══════════════════════════════════════
   THEME TOGGLE — Dark / Light
   ═══════════════════════════════════════ */
function initThemeToggle() {
    const toggleBtn = document.getElementById('themeToggle');
    if (!toggleBtn) return;

    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    }

    toggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        if (newTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }

        localStorage.setItem('theme', newTheme);
    });
}

/* ═══════════════════════════════════════
   PROJECT CARDS — Expand / Collapse
   ═══════════════════════════════════════ */
function initProjectCards() {
    const cards = document.querySelectorAll('.project-card');
    if (!cards.length) return;

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const isExpanded = card.classList.contains('expanded');

            // Collapse all cards first
            cards.forEach(c => c.classList.remove('expanded'));

            // Toggle clicked card
            if (!isExpanded) {
                card.classList.add('expanded');
                // Smooth scroll to the card
                setTimeout(() => {
                    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 300);
            }
        });
    });
}
