/* ═══════════════════════════════════════════════════════════════
   CAIO PEDROSO — INVESTIGATION BOARD ENGINE
   Câmera cinematográfica (scroll + clique) sobre um quadro gigante,
   parallax de mouse em camadas e fios vermelhos entre evidências.
   ═══════════════════════════════════════════════════════════════ */

(() => {
    'use strict';

    const world    = document.getElementById('world');
    const bgLayer  = document.getElementById('bgLayer');
    const fgLayer  = document.getElementById('fgLayer');
    const strings  = document.getElementById('strings');
    const spacer   = document.getElementById('scrollSpacer');
    const caseNav  = document.getElementById('caseNav');
    const progressBar = document.getElementById('progressBar');
    const scrollHint  = document.getElementById('scrollHint');
    const loader   = document.getElementById('loader');

    const clusters = Array.from(document.querySelectorAll('.cluster'))
        .sort((a, b) => (+a.dataset.step) - (+b.dataset.step));
    const N = clusters.length;
    const M = N + 1;            // total waypoints (overview + each cluster)

    // ── Tunables ──────────────────────────────────────────────
    const FRAME_PAD    = 1.08;  // breathing room around a framed cluster
    const OVERVIEW_PAD = 1.07;  // breathing room — reveals the frame + room edge
    const STEP_VH     = 1.05;   // viewports of scroll per section
    const CAM_LERP    = 0.085;  // camera smoothing (lower = smoother/heavier)
    const MOUSE_LERP  = 0.06;   // parallax smoothing
    const AMP_WORLD   = 26;     // mouse parallax amplitude — board layer (px)
    const AMP_BG      = 12;     // far background (moves less = deeper)
    const AMP_FG      = 52;     // foreground vignette/dust (moves most = closer)

    // EDIT MODE — temporary: drag any card/photo/note to reposition, then "Exportar Layout".
    // Set to false (and the handlers no-op) once the layout is locked in.
    const EDIT_MODE   = false;

    // String connections between pins (the investigation web)
    const LINKS = [
        // threads radiating from the suspect to each section
        ['pin-hero', 'pin-sobre'],
        ['pin-hero', 'pin-formacao'],
        ['pin-hero', 'pin-certs'],
        ['pin-hero', 'pin-exp'],
        ['pin-hero', 'pin-stack'],
        ['pin-hero', 'pin-proj-own'],
        ['pin-hero', 'pin-contato'],
        // cross-connections — the tangled web
        ['pin-formacao', 'pin-certs'],
        ['pin-exp', 'pin-stack'],
        ['pin-sobre', 'pin-stack'],
        ['pin-formacao', 'pin-contato'],
        ['pin-certs', 'pin-exp'],
        ['pin-contato', 'pin-certs'],
        // PROJECTS hub: every project photo ties to the "autoria própria" pin
        ['pin-proj-own', 'pin-proj'],
        ['pin-proj-own', 'pin-pg2'],
        ['pin-proj-own', 'pin-pg3'],
        ['pin-proj-own', 'pin-pg4'],
        ['pin-proj-own', 'pin-pg5'],
        ['pin-proj-own', 'pin-pg6'],
        ['pin-proj-own', 'pin-pg7'],
        ['pin-proj-own', 'pin-pg8'],
    ];

    let vw = window.innerWidth;
    let vh = window.innerHeight;

    // ── State ─────────────────────────────────────────────────
    const cam   = { cx: 0, cy: 0, s: 1 };   // current (rendered)
    const tgt   = { cx: 0, cy: 0, s: 1 };   // target (from scroll)
    const mouse = { x: 0, y: 0 };           // current parallax offset
    const mtgt  = { x: 0, y: 0 };           // target parallax offset
    let firstScrolled = false;
    let stillFrames = 0;                    // frames the camera has been settled
    let worldLayered = true;                // is the world currently a GPU layer (will-change)?

    // ── Helpers ───────────────────────────────────────────────
    const lerp  = (a, b, t) => a + (b - a) * t;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const easeInOut = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    // ── Content-based bounds ──────────────────────────────────
    // Frames follow the ACTUAL evidence (wherever cards were dragged),
    // not the declared cluster box — so zoom & overview stay tight to content.
    function boundsOf(parent) {
        let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
        const ox = parent.offsetLeft, oy = parent.offsetTop;
        for (const ch of parent.children) {
            if (ch.tagName === 'svg') continue;          // skip the threads layer
            const cl = ox + ch.offsetLeft, ct = oy + ch.offsetTop;
            if (cl < l) l = cl;
            if (ct < t) t = ct;
            if (cl + ch.offsetWidth > r)  r = cl + ch.offsetWidth;
            if (ct + ch.offsetHeight > b) b = ct + ch.offsetHeight;
        }
        return { l, t, r, b };
    }
    function unionInto(u, x) {
        if (x.l < u.l) u.l = x.l;
        if (x.t < u.t) u.t = x.t;
        if (x.r > u.r) u.r = x.r;
        if (x.b > u.b) u.b = x.b;
    }

    // Cached bounds (content doesn't move except during edit-drag / resize)
    let clusterBounds = [];
    let worldBounds = { l: 0, t: 0, r: 100, b: 100 };
    function measure() {
        clusterBounds = clusters.map(boundsOf);
        const u = { l: Infinity, t: Infinity, r: -Infinity, b: -Infinity };
        clusterBounds.forEach(x => unionInto(u, x));
        const sc = document.querySelector('.scatter');
        if (sc) unionInto(u, boundsOf(sc));
        worldBounds = u;
    }

    function frameBounds(bx, pad) {
        const w = Math.max(1, bx.r - bx.l);
        const h = Math.max(1, bx.b - bx.t);
        return {
            cx: bx.l + w / 2,
            cy: bx.t + h / 2,
            s: Math.min(vw / (w * pad), vh / (h * pad)),
        };
    }

    // Waypoint by index: 0 = overview (all content), 1..N = each section's content
    function frameAt(i) {
        return i === 0
            ? frameBounds(worldBounds, OVERVIEW_PAD)
            : frameBounds(clusterBounds[i - 1], FRAME_PAD);
    }

    // Scroll geometry
    let stepPx = vh * STEP_VH;
    function layoutScroll() {
        vw = window.innerWidth;
        vh = window.innerHeight;
        stepPx = vh * STEP_VH;
        spacer.style.height = ((M - 1) * stepPx + vh) + 'px';
    }

    // Progress (0 .. M-1) from scroll position
    function scrollProgress() {
        const max = (M - 1) * stepPx;
        return clamp(window.scrollY / max, 0, 1) * (M - 1);
    }

    // ── Build case navigation (overview + each section) ───────
    const stepNames = ['Quadro Geral', ...clusters.map((c, i) => c.dataset.name || ('Seção ' + i))];
    stepNames.forEach((name, i) => {
        const btn = document.createElement('button');
        btn.innerHTML = `<span>${name}</span><i class="dot"></i>`;
        btn.addEventListener('click', () => goToStep(i));
        caseNav.appendChild(btn);
    });
    const navBtns = Array.from(caseNav.children);

    function goToStep(i) {
        const y = clamp(i, 0, M - 1) * stepPx;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }

    // ── Apply transforms each frame ───────────────────────────
    function render() {
        // target camera from scroll
        const p = scrollProgress();
        const i = Math.floor(p);
        const t = easeInOut(p - i);
        const A = frameAt(i);
        const B = frameAt(Math.min(i + 1, M - 1));
        tgt.cx = lerp(A.cx, B.cx, t);
        tgt.cy = lerp(A.cy, B.cy, t);
        tgt.s  = lerp(A.s,  B.s,  t);

        // smooth camera
        cam.cx = lerp(cam.cx, tgt.cx, CAM_LERP);
        cam.cy = lerp(cam.cy, tgt.cy, CAM_LERP);
        cam.s  = lerp(cam.s,  tgt.s,  CAM_LERP);

        // smooth mouse parallax
        mouse.x = lerp(mouse.x, mtgt.x, MOUSE_LERP);
        mouse.y = lerp(mouse.y, mtgt.y, MOUSE_LERP);

        // Is the camera still moving?
        const moving =
            Math.abs(tgt.cx - cam.cx) > 0.3 ||
            Math.abs(tgt.cy - cam.cy) > 0.3 ||
            Math.abs(tgt.s  - cam.s)  > 0.0004 ||
            Math.abs(mtgt.x - mouse.x) > 0.003 ||
            Math.abs(mtgt.y - mouse.y) > 0.003;

        // When settled, snap exactly to target so the transform stops changing
        if (!moving) {
            cam.cx = tgt.cx; cam.cy = tgt.cy; cam.s = tgt.s;
            mouse.x = mtgt.x; mouse.y = mtgt.y;
        }

        const tx = vw / 2 - cam.cx * cam.s + mouse.x * AMP_WORLD;
        const ty = vh / 2 - cam.cy * cam.s + mouse.y * AMP_WORLD;
        world.style.transform = `translate(${tx}px, ${ty}px) scale(${cam.s})`;

        // Crisp text: keep the GPU layer (will-change) only WHILE moving — smooth.
        // Once settled, drop it so the browser repaints the board at real resolution — sharp.
        if (moving) {
            stillFrames = 0;
            if (!worldLayered) { world.style.willChange = 'transform'; worldLayered = true; }
        } else if (worldLayered && ++stillFrames > 6) {
            world.style.willChange = 'auto';
            worldLayered = false;
        }

        // layered parallax
        bgLayer.style.transform = `translate(${mouse.x * AMP_BG}px, ${mouse.y * AMP_BG}px) scale(1.1)`;
        fgLayer.style.transform = `translate(${mouse.x * AMP_FG}px, ${mouse.y * AMP_FG}px)`;

        // Threads fade slightly once you leave the overview (easier to read a section)
        strings.style.opacity = (1 - 0.62 * clamp(p, 0, 1)).toFixed(3);

        // UI
        progressBar.style.width = (p / (M - 1) * 100) + '%';
        const active = Math.round(p);
        navBtns.forEach((b, k) => b.classList.toggle('active', k === active));

        requestAnimationFrame(render);
    }

    // ── Mouse parallax input ──────────────────────────────────
    window.addEventListener('mousemove', e => {
        if (EDIT_MODE) return;   // freeze parallax while editing, so drag math is exact
        // -1 .. 1 relative to viewport centre; negative => move board opposite
        mtgt.x = -((e.clientX / vw) * 2 - 1);
        mtgt.y = -((e.clientY / vh) * 2 - 1);
    });

    // ── Scroll → hide hint on first interaction ───────────────
    window.addEventListener('scroll', () => {
        if (!firstScrolled && window.scrollY > 20) {
            firstScrolled = true;
            scrollHint.style.opacity = '0';
        }
    }, { passive: true });

    // ── Keyboard ──────────────────────────────────────────────
    window.addEventListener('keydown', e => {
        const cur = Math.round(scrollProgress());
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
            e.preventDefault(); goToStep(cur + 1);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault(); goToStep(cur - 1);
        } else if (e.key === 'Home') {
            e.preventDefault(); goToStep(0);
        } else if (e.key === 'End') {
            e.preventDefault(); goToStep(M - 1);
        }
    });

    // ── Red threads ───────────────────────────────────────────
    function pinWorldXY(id) {
        const el = document.getElementById(id);
        if (!el) return null;
        const wr = world.getBoundingClientRect();
        const scale = wr.width / world.offsetWidth;     // current rendered scale
        const r = el.getBoundingClientRect();
        return {
            x: (r.left + r.width / 2 - wr.left) / scale,
            y: (r.top + r.height / 2 - wr.top) / scale,
        };
    }

    function drawStrings() {
        let d = '';
        const nodes = [];
        LINKS.forEach(([a, b]) => {
            const pa = pinWorldXY(a);
            const pb = pinWorldXY(b);
            if (!pa || !pb) return;
            const mx = (pa.x + pb.x) / 2;
            const my = (pa.y + pb.y) / 2;
            const dist = Math.hypot(pb.x - pa.x, pb.y - pa.y);
            const sag = dist * 0.12;                     // gravity sag
            d += `M ${pa.x} ${pa.y} Q ${mx} ${my + sag} ${pb.x} ${pb.y} `;
            nodes.push(pa, pb);
        });
        // single combined path for the threads
        strings.innerHTML = '';
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d.trim());
        strings.appendChild(path);
        // small knots at pin anchors
        nodes.forEach(n => {
            const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            c.setAttribute('cx', n.x); c.setAttribute('cy', n.y); c.setAttribute('r', 4);
            c.setAttribute('fill', '#8c1410');
            strings.appendChild(c);
        });
    }

    // ── Floating dust in foreground ───────────────────────────
    function spawnDust() {
        for (let i = 0; i < 18; i++) {
            const d = document.createElement('span');
            d.className = 'dust';
            const sz = 1 + (i % 4);
            d.style.width = d.style.height = sz + 'px';
            d.style.left = ((i * 53) % 100) + '%';
            d.style.top = ((i * 37) % 100) + '%';
            d.style.opacity = 0.2 + (i % 5) * 0.12;
            d.style.animation = `drift ${5 + (i % 6)}s ease-in-out ${i * 0.3}s infinite`;
            fgLayer.appendChild(d);
        }
    }

    // ── EDIT MODE — drag to reposition every card / photo / note ──
    let dragEl = null, dragStart = null, dragMoved = false;

    function initEdit() {
        if (!EDIT_MODE) return;
        document.body.classList.add('editing');

        // Tag everything draggable: each cluster, its direct children, and loose scatter items
        document.querySelectorAll('.cluster').forEach((c, ci) => {
            c.dataset.drag = '1';
            Array.from(c.children).forEach(ch => { ch.dataset.drag = '1'; });
        });
        document.querySelectorAll('.scatter > *').forEach(el => { el.dataset.drag = '1'; });

        world.addEventListener('pointerdown', onDragDown);
        world.addEventListener('wheel', onTransformWheel, { passive: false });

        // Export button
        const btn = document.createElement('button');
        btn.id = 'exportBtn';
        btn.innerHTML = '📍 Exportar Layout';
        btn.addEventListener('click', exportLayout);
        document.body.appendChild(btn);

        // Hint
        const hint = document.createElement('div');
        hint.className = 'edit-hint';
        hint.textContent = 'MODO EDIÇÃO · arraste · scroll sobre o item = redimensionar · Shift+scroll = girar · "Exportar Layout" ao terminar';
        document.body.appendChild(hint);
    }

    // Topmost loose-evidence item whose visual box is under the pointer
    // (makes thin SVG doodles grabbable anywhere, regardless of SVG hit-testing)
    function pickScatterAt(x, y) {
        const items = document.querySelectorAll('.scatter > [data-drag]');
        for (let i = items.length - 1; i >= 0; i--) {
            const r = items[i].getBoundingClientRect();
            if (r.width && r.height && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return items[i];
        }
        return null;
    }

    // Current left/top in px — works for HTML *and* SVG (SVG has no offsetLeft)
    function curLeft(el) { const v = parseFloat(el.style.left); return Number.isNaN(v) ? (el.offsetLeft || 0) : v; }
    function curTop(el)  { const v = parseFloat(el.style.top);  return Number.isNaN(v) ? (el.offsetTop || 0) : v; }

    function onDragDown(e) {
        const el = pickScatterAt(e.clientX, e.clientY) || e.target.closest('[data-drag]');
        if (!el) return;
        dragEl = el;
        dragMoved = false;
        dragStart = { mx: e.clientX, my: e.clientY, left: curLeft(el), top: curTop(el), scale: cam.s };
        window.addEventListener('pointermove', onDragMove);
        window.addEventListener('pointerup', onDragUp);
    }
    function onDragMove(e) {
        if (!dragEl) return;
        const ddx = e.clientX - dragStart.mx, ddy = e.clientY - dragStart.my;
        if (!dragMoved) {
            if (Math.hypot(ddx, ddy) < 5) return;      // under threshold → it's a click, not a drag
            dragMoved = true;
            dragEl.classList.add('dragging');
        }
        dragEl.style.left = Math.round(dragStart.left + ddx / dragStart.scale) + 'px';
        dragEl.style.top  = Math.round(dragStart.top + ddy / dragStart.scale) + 'px';
    }
    function onDragUp() {
        window.removeEventListener('pointermove', onDragMove);
        window.removeEventListener('pointerup', onDragUp);
        if (dragEl && dragMoved) {
            dragEl.classList.remove('dragging');
            // swallow the click the browser fires right after a drag
            const supEl = dragEl;
            const sup = ev => { ev.stopPropagation(); ev.preventDefault(); supEl.removeEventListener('click', sup, true); };
            supEl.addEventListener('click', sup, true);
            measure();
            drawStrings();
        }
        dragEl = null;
    }

    // ── Resize (wheel) & rotate (Shift+wheel) any element while editing ──
    function elRot(el) {
        if (el.dataset.rot !== undefined) return parseFloat(el.dataset.rot);
        const m = (el.style.transform || '').match(/rotate\(([-\d.]+)deg\)/);
        return m ? parseFloat(m[1]) : 0;
    }
    function elScale(el) {
        if (el.dataset.scl !== undefined) return parseFloat(el.dataset.scl);
        const m = (el.style.transform || '').match(/scale\(([-\d.]+)\)/);
        return m ? parseFloat(m[1]) : 1;
    }
    function applyTransform(el) {
        el.style.transform = `rotate(${(+elRot(el)).toFixed(1)}deg) scale(${(+elScale(el)).toFixed(3)})`;
    }
    function onTransformWheel(e) {
        const el = pickScatterAt(e.clientX, e.clientY) || e.target.closest('[data-drag]');
        if (!el) return;                       // over empty cork → let the camera scroll
        e.preventDefault();
        if (e.shiftKey) {
            el.dataset.rot = (elRot(el) + (e.deltaY < 0 ? 4 : -4)).toFixed(1);
        } else {
            const s = Math.max(0.3, Math.min(4, elScale(el) * (e.deltaY < 0 ? 1.08 : 1 / 1.08)));
            el.dataset.scl = s.toFixed(3);
        }
        applyTransform(el);
        measure();
        drawStrings();
    }

    // ── Project polaroids: click the photo → post-it with the description ──
    let openNote = null;
    function initProjectCards() {
        document.querySelectorAll('.polaroid[data-desc]').forEach(card => {
            card.classList.add('has-note');
            card.addEventListener('click', e => {
                if (e.target.closest('.proj-note-link')) return;          // let the link open
                if (e.target.closest('.proj-note')) { closeNote(card); return; }
                if (card.classList.contains('note-open')) { closeNote(card); return; }
                if (openNote) closeNote(openNote);
                openNoteOn(card);
            });
        });
    }
    function openNoteOn(card) {
        const tags = (card.dataset.tags || '').split(',').map(t => t.trim()).filter(Boolean)
            .map(t => `<span>${t}</span>`).join('');
        const link = card.dataset.link
            ? `<a class="proj-note-link" href="${card.dataset.link}" target="_blank" rel="noopener"><i class="fas fa-arrow-up-right-from-square"></i> Acessar projeto</a>` : '';
        const note = document.createElement('div');
        note.className = 'proj-note';
        note.innerHTML = '<button class="proj-note-x" aria-label="Fechar">&times;</button>' +
            '<h4>' + (card.dataset.title || '') + '</h4>' +
            '<div class="proj-note-tags">' + tags + '</div>' +
            '<p>' + (card.dataset.desc || '') + '</p>' + link;
        card.appendChild(note);
        card.classList.add('note-open');
        openNote = card;
    }
    function closeNote(card) {
        const n = card.querySelector('.proj-note');
        if (n) n.remove();
        card.classList.remove('note-open');
        if (openNote === card) openNote = null;
    }

    // ── Lightbox: click a diploma/certificate photo → expand it fullscreen ──
    function initLightbox() {
        const lb = document.createElement('div');
        lb.className = 'lightbox';
        lb.innerHTML = '<img alt="Documento ampliado"><button class="lightbox-x" aria-label="Fechar">&times;</button>';
        document.body.appendChild(lb);
        const lbImg = lb.querySelector('img');
        const close = () => lb.classList.remove('open');
        lb.addEventListener('click', close);
        document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
        document.querySelectorAll('img.zoom').forEach(img => {
            img.addEventListener('click', e => {
                e.stopPropagation();
                lbImg.src = img.currentSrc || img.src;
                lb.classList.add('open');
            });
        });
        // elements carrying a data-zoom path (e.g. mobile certificate tickets / diplomas)
        document.querySelectorAll('[data-zoom]').forEach(el => {
            el.addEventListener('click', e => {
                e.stopPropagation();
                lbImg.src = el.dataset.zoom;
                lb.classList.add('open');
            });
        });
    }

    // ── Certificates: click a chip → show its image in the polaroid + highlight it ──
    function initCertGallery() {
        const photo = document.getElementById('certPhoto');
        const cap = document.getElementById('certCaption');
        const chips = document.querySelectorAll('.evi-chip[data-cert]');
        if (!photo || !chips.length) return;
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                photo.src = chip.dataset.cert;
                const name = chip.childNodes[0] ? chip.childNodes[0].textContent.trim() : '';
                photo.alt = name;
                if (cap) cap.textContent = name;
                chips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                const poll = document.getElementById('certPolaroid');
                if (poll) { poll.classList.remove('flash'); void poll.offsetWidth; poll.classList.add('flash'); }
            });
        });
    }

    // Export the world's current layout (with the new positions baked into the inline styles)
    function exportLayout() {
        const clone = world.cloneNode(true);
        clone.querySelectorAll('#strings').forEach(s => { s.innerHTML = ''; });
        clone.querySelectorAll('[data-drag]').forEach(el => {
            el.removeAttribute('data-drag');
            el.removeAttribute('data-rot');
            el.removeAttribute('data-scl');
            el.classList.remove('dragging');
        });
        const html = clone.innerHTML;
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'board-layout.html';
        document.body.appendChild(a);
        a.click();
        a.remove();
        const btn = document.getElementById('exportBtn');
        if (btn) { const t = btn.innerHTML; btn.innerHTML = '✅ Baixado!'; setTimeout(() => btn.innerHTML = t, 1500); }
    }

    // ── Init ──────────────────────────────────────────────────
    function init() {
        layoutScroll();
        measure();
        spawnDust();
        initEdit();
        initProjectCards();
        initCertGallery();
        initLightbox();
        // seed camera at the overview so the first paint shows the whole board
        const f0 = frameAt(0);
        cam.cx = tgt.cx = f0.cx;
        cam.cy = tgt.cy = f0.cy;
        cam.s  = tgt.s  = f0.s;
        window.scrollTo(0, 0);
        requestAnimationFrame(render);
        // strings need fonts/layout settled
        setTimeout(drawStrings, 120);
    }

    // Small screens get the "ransom note" résumé instead of the heavy board.
    const isMobile = () => window.matchMedia('(max-width: 820px)').matches;

    window.addEventListener('resize', () => {
        if (isMobile()) return;
        layoutScroll();
        measure();
        drawStrings();
    });

    function boot() {
        if (isMobile()) {
            loader.classList.add('hidden');   // CSS shows the .ransom layout
            initLightbox();                    // tap a photo to zoom (mobile)
            return;
        }
        init();
        loader.classList.add('hidden');
        setTimeout(() => { measure(); drawStrings(); }, 600);
    }

    if (document.readyState === 'complete') {
        boot();
    } else {
        window.addEventListener('load', () => {
            if (isMobile()) { loader.classList.add('hidden'); initLightbox(); return; }
            init();
            setTimeout(() => loader.classList.add('hidden'), 450);
            setTimeout(() => { measure(); drawStrings(); }, 600);
        });
    }
})();
