/* ═══════════════════════════════════════════════════════
   PORTFOLIO DASHBOARD — SCRIPTS
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initNavTabs();
    initScrollAnimations();
    initSidebarSkills();
    initIASkills();
    initHeroStats();
    initProjectCards();
    initTypingAnimation();
});

/* ═══════════════════════════════════════
   MOBILE MENU — Sidebar Toggle
   ═══════════════════════════════════════ */
function initMobileMenu() {
    const toggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (!toggle || !sidebar) return;

    function openMenu() {
        toggle.classList.add('active');
        sidebar.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        toggle.classList.remove('active');
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    toggle.addEventListener('click', () => {
        if (sidebar.classList.contains('open')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    overlay.addEventListener('click', closeMenu);

    const closeBtn = document.getElementById('sidebarClose');
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });
}

/* ═══════════════════════════════════════
   NAVIGATION TABS — Scroll Spy
   ═══════════════════════════════════════ */
function initNavTabs() {
    const tabs = document.querySelectorAll('.nav-tab');
    const sections = document.querySelectorAll('.content-section');
    if (!tabs.length || !sections.length) return;

    function showSection(targetId) {
        sections.forEach(section => {
            section.style.display = section.id === targetId ? '' : 'none';
        });
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.getAttribute('data-target') === targetId);
        });
    }

    // Click handler
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            showSection(tab.getAttribute('data-target'));
        });
    });

    // Show first section by default
    showSection('sobre');
}

/* ═══════════════════════════════════════
   SCROLL ANIMATIONS — Intersection Observer
   ═══════════════════════════════════════ */
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1,
    });

    document.querySelectorAll('[data-aos]').forEach((el) => {
        observer.observe(el);
    });
}

/* ═══════════════════════════════════════
   SIDEBAR SKILLS — Animated Fill on Load
   ═══════════════════════════════════════ */
function initSidebarSkills() {
    const bars = document.querySelectorAll('.sidebar-skill-fill');
    if (!bars.length) return;

    // Animate after a short delay for visual impact
    setTimeout(() => {
        bars.forEach((bar, index) => {
            const width = bar.getAttribute('data-width');
            setTimeout(() => {
                bar.style.width = width + '%';
            }, index * 120);
        });
    }, 500);
}

/* ═══════════════════════════════════════
   IA SKILLS — Animated Fill on Scroll
   ═══════════════════════════════════════ */
function initIASkills() {
    const section = document.getElementById('ia');
    if (!section) return;

    let animated = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting && !animated) {
                animated = true;
                const bars = section.querySelectorAll('.ia-bar-fill');
                bars.forEach((bar, index) => {
                    const width = bar.getAttribute('data-width');
                    setTimeout(() => {
                        bar.style.width = width + '%';
                    }, index * 150);
                });
            }
        });
    }, { threshold: 0.3 });

    observer.observe(section);
}

/* ═══════════════════════════════════════
   HERO STATS — Animated Counters
   ═══════════════════════════════════════ */
function initHeroStats() {
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
    const duration = 1800;
    const start = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
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
   PROJECT CARDS — Modal
   ═══════════════════════════════════════ */
function initProjectCards() {
    const cards = document.querySelectorAll('.project-card');
    const modal = document.getElementById('projectModal');
    if (!cards.length || !modal) return;

    const modalImg = document.getElementById('modalImg');
    const modalTags = document.getElementById('modalTags');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDesc');
    const closeBtn = modal.querySelector('.modal-close');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const img = card.querySelector('.project-img img');
            const tags = card.querySelectorAll('.project-tags .tag');
            const title = card.querySelector('.project-title');
            const desc = card.querySelector('.project-desc');

            modalImg.src = img.src;
            modalImg.alt = img.alt;
            modalTitle.textContent = title.textContent;
            modalDesc.textContent = desc.textContent;

            modalTags.innerHTML = '';
            tags.forEach(tag => {
                const span = document.createElement('span');
                span.className = 'tag';
                span.textContent = tag.textContent;
                modalTags.appendChild(span);
            });

            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

/* ═══════════════════════════════════════
   TYPING ANIMATION — Hero Subtitle
   ═══════════════════════════════════════ */
function initTypingAnimation() {
    const el = document.getElementById('typingText');
    if (!el) return;

    const phrases = [
        'BI Analyst',
        'Business Automation'
    ];

    const typeSpeed = 65;
    const eraseSpeed = 35;
    const pauseAfterType = 2200;
    const pauseAfterErase = 400;

    let phraseIndex = 0;
    let charIndex = 0;
    let isErasing = false;

    // Start after a brief delay
    setTimeout(typeLoop, 800);

    function typeLoop() {
        const currentPhrase = phrases[phraseIndex];

        if (!isErasing) {
            el.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;

            if (charIndex < currentPhrase.length) {
                setTimeout(typeLoop, typeSpeed);
            } else {
                isErasing = true;
                setTimeout(typeLoop, pauseAfterType);
            }
        } else {
            el.textContent = currentPhrase.substring(0, charIndex);
            charIndex--;

            if (charIndex >= 0) {
                setTimeout(typeLoop, eraseSpeed);
            } else {
                isErasing = false;
                charIndex = 0;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                setTimeout(typeLoop, pauseAfterErase);
            }
        }
    }
}
