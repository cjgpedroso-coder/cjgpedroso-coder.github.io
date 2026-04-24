/* ═══════════════════════════════════════════════════════
   CAIO PEDROSO — PORTFOLIO SCRIPTS
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    initTopNav();
    initBurger();
    initScrollAnimations();
    initStackBars();
    initStatCounters();
    initProjectModal();
    initCertModal();
    initTypingAnimation();
    initActiveNavSpy();
});

/* ═══════════════════════════════════════
   TOP NAV — solid on scroll
   ═══════════════════════════════════════ */
function initTopNav() {
    const nav = document.getElementById('topnav');
    if (!nav) return;
    const onScroll = () => {
        nav.classList.toggle('scrolled', window.scrollY > 30);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
}

/* ═══════════════════════════════════════
   BURGER — mobile menu
   ═══════════════════════════════════════ */
function initBurger() {
    const burger = document.getElementById('topnavBurger');
    const links = document.getElementById('topnavLinks');
    if (!burger || !links) return;

    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        links.classList.toggle('open');
    });

    links.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            burger.classList.remove('active');
            links.classList.remove('open');
        });
    });
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
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.1,
    });

    document.querySelectorAll('[data-aos]').forEach((el) => observer.observe(el));
}

/* ═══════════════════════════════════════
   STACK BARS — animate on scroll
   ═══════════════════════════════════════ */
function initStackBars() {
    const bars = document.querySelectorAll('.stack-fill');
    if (!bars.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const bar = entry.target;
            const width = bar.getAttribute('data-width');
            setTimeout(() => { bar.style.width = width + '%'; }, 100);
            observer.unobserve(bar);
        });
    }, { threshold: 0.3 });

    bars.forEach(bar => observer.observe(bar));
}

/* ═══════════════════════════════════════
   STAT COUNTERS — animated numbers
   ═══════════════════════════════════════ */
function initStatCounters() {
    const stats = document.querySelectorAll('.stat-num[data-target]');
    if (!stats.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            animateCounter(entry.target);
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.3 });

    stats.forEach(el => observer.observe(el));
}

function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1800;
    const start = performance.now();

    function update(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(eased * target);
        if (p < 1) requestAnimationFrame(update);
        else el.textContent = target;
    }
    requestAnimationFrame(update);
}

/* ═══════════════════════════════════════
   PROJECT CARDS — Modal
   ═══════════════════════════════════════ */
function initProjectModal() {
    const cards = document.querySelectorAll('.project-card');
    const modal = document.getElementById('projectModal');
    if (!cards.length || !modal) return;

    const modalImg = document.getElementById('modalImg');
    const modalTags = document.getElementById('modalTags');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDesc');
    const closeBtn = modal.querySelector('.modal-close');

    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't open modal when clicking inner link
            if (e.target.closest('.project-link')) return;

            const img = card.querySelector('.project-img img');
            const tags = card.querySelectorAll('.project-tags .tag');
            const title = card.querySelector('.project-title');
            const desc = card.querySelector('.project-desc');
            if (!img || !title) return;

            modalImg.src = img.src;
            modalImg.alt = img.alt;
            modalTitle.textContent = title.textContent;
            modalDesc.textContent = desc ? desc.textContent : '';

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
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });
}

/* ═══════════════════════════════════════
   CERT MODAL — Certificate preview
   ═══════════════════════════════════════ */
function initCertModal() {
    const buttons = document.querySelectorAll('.btn-cert');
    const modal = document.getElementById('certModal');
    if (!buttons.length || !modal) return;

    const imgWrap = modal.querySelector('.cert-modal-img');
    const img = document.getElementById('certImg');
    const title = document.getElementById('certTitle');
    const closeBtn = modal.querySelector('.modal-close');

    function open(src, label) {
        title.textContent = label || '';
        imgWrap.classList.remove('empty');
        img.onload = function() { imgWrap.classList.remove('empty'); };
        img.onerror = function() { imgWrap.classList.add('empty'); };
        img.src = src || '';
        img.alt = label || '';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function close() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        img.src = '';
        imgWrap.classList.remove('empty');
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            open(btn.dataset.cert, btn.dataset.title);
        });
    });

    closeBtn.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) close();
    });
}

/* ═══════════════════════════════════════
   TYPING ANIMATION — Hero role
   ═══════════════════════════════════════ */
function initTypingAnimation() {
    const el = document.getElementById('typingText');
    if (!el) return;

    const phrases = [
        'BI Analyst',
        'Business Automation',
        'Python Developer',
        'Data Enthusiast'
    ];

    const typeSpeed = 65;
    const eraseSpeed = 30;
    const pauseAfterType = 2000;
    const pauseAfterErase = 400;

    let phraseIndex = 0;
    let charIndex = 0;
    let isErasing = false;

    setTimeout(typeLoop, 700);

    function typeLoop() {
        const current = phrases[phraseIndex];

        if (!isErasing) {
            el.textContent = current.substring(0, charIndex + 1);
            charIndex++;
            if (charIndex < current.length) {
                setTimeout(typeLoop, typeSpeed);
            } else {
                isErasing = true;
                setTimeout(typeLoop, pauseAfterType);
            }
        } else {
            el.textContent = current.substring(0, charIndex);
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

/* ═══════════════════════════════════════
   ACTIVE NAV SPY — highlight current section
   ═══════════════════════════════════════ */
function initActiveNavSpy() {
    const sections = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.topnav-link');
    if (!sections.length || !links.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const id = entry.target.id;
            links.forEach(link => {
                const target = link.getAttribute('href').replace('#', '');
                link.classList.toggle('active', target === id);
            });
        });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

    sections.forEach(s => observer.observe(s));
}
