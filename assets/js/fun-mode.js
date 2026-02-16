/* ═══════════════════════════════════════════════════════
   FUN MODE — Interactive Scripts (Desktop Only)
   ═══════════════════════════════════════════════════════ */

(function () {
    // Only on desktop
    if (window.innerWidth <= 768) return;

    document.addEventListener('DOMContentLoaded', initFunMode);

    function initFunMode() {
        const entryOverlay = document.getElementById('funEntryOverlay');
        if (!entryOverlay) return;

        const btnCommon = document.getElementById('funBtnCommon');
        const btnFun = document.getElementById('funBtnFun');

        // Common mode — just dismiss the modal
        btnCommon.addEventListener('click', () => {
            entryOverlay.classList.add('hidden');
            setTimeout(() => entryOverlay.remove(), 600);
        });

        // Fun mode — start the experience
        btnFun.addEventListener('click', () => {
            // Show fake offline screen INSTANTLY behind the overlay
            const dinoScreen = document.getElementById('funDinoScreen');
            document.body.style.overflow = 'hidden';
            dinoScreen.classList.add('active');

            // Then fade out the entry overlay
            entryOverlay.classList.add('hidden');
            setTimeout(() => {
                entryOverlay.remove();
                // After 4 seconds from now, show the "gotcha" modal
                setTimeout(() => {
                    showSequenceModal(0);
                }, 4000);
            }, 500);
        });
    }

    /* ═══════════════════════════════════════
       FUN SEQUENCE — Fake Offline + Modals
       ═══════════════════════════════════════ */
    function startFunSequence() {
        // Hide the real page
        document.body.style.overflow = 'hidden';

        // Show fake offline screen
        const dinoScreen = document.getElementById('funDinoScreen');
        dinoScreen.classList.add('active');

        // After 2 seconds, show the "gotcha" modal
        setTimeout(() => {
            showSequenceModal(0);
        }, 4000);
    }

    /* ─── Modal Sequence ─── */
    const modalSequence = [
        {
            emoji: '',
            text: 'HAHA peguei você! Vamos começar então!',
            showDodge: false
        },
        {
            emoji: '',
            text: 'Você selecionou o currículo divertido, então vou explicar como vai funcionar.',
            showDodge: false
        },
        {
            emoji: '',
            text: 'Você pode desistir a qualquer momento ok? Basta clicar em "Comum"',
            showDodge: true
        },
        {
            emoji: '',
            text: 'Se você tentou clicar em "Comum", percebeu que o comum foge de você. Bom... O "Comum" sempre fugiu de mim também.',
            showDodge: true
        },
        {
            emoji: '',
            text: 'HAHA aposto que quem não apertou antes, tentou agora! Não, vamos até o final agora, lamento.',
            showDodge: false
        }
    ];

    let currentModalStep = 0;

    function showSequenceModal(step) {
        currentModalStep = step;
        const data = modalSequence[step];
        if (!data) {
            // Sequence finished — show countdown then start dino game
            hideSequenceModal();
            showCountdownModal();
            return;
        }

        const overlay = document.getElementById('funModalOverlay');
        const emoji = document.getElementById('funModalEmoji');
        const text = document.getElementById('funModalText');
        const dodgeBtn = document.getElementById('funDodgeBtn');
        const nextBtn = document.getElementById('funNextBtn');

        emoji.textContent = data.emoji;
        text.textContent = data.text;

        // Show/hide dodge button — starts normal, dodges on hover
        if (data.showDodge) {
            dodgeBtn.style.display = '';
            dodgeBtn.style.position = '';
            dodgeBtn.style.left = '';
            dodgeBtn.style.top = '';
            enableDodge(dodgeBtn);
        } else {
            dodgeBtn.style.display = 'none';
            disableDodge();
        }

        overlay.classList.add('active');

        // Next button
        nextBtn.onclick = () => {
            showSequenceModal(step + 1);
        };
    }

    function hideSequenceModal() {
        const overlay = document.getElementById('funModalOverlay');
        overlay.classList.remove('active');
        disableDodge();
    }

    /* ─── Countdown Modal ─── */
    function showCountdownModal() {
        const overlay = document.getElementById('funModalOverlay');
        const emoji = document.getElementById('funModalEmoji');
        const text = document.getElementById('funModalText');
        const dodgeBtn = document.getElementById('funDodgeBtn');
        const nextBtn = document.getElementById('funNextBtn');

        dodgeBtn.style.display = 'none';
        nextBtn.style.display = 'none';

        emoji.innerHTML = '<img src="assets/img/dinossauro-olimpic.png" style="width:100px;height:100px;object-fit:contain;display:block;margin:0 auto">';
        let countdown = 5;
        text.innerHTML = 'Avance no jogo do dinossauro para liberar mais partes do meu currículo. Boa sorte!<br><br><span style="font-size:2.5rem;font-weight:800;color:#667eea">' + countdown + '</span>';

        overlay.classList.add('active');

        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                overlay.classList.remove('active');
                nextBtn.style.display = '';
                startDinoGameReveal();
            } else {
                text.innerHTML = 'Avance no jogo do dinossauro para liberar mais partes do meu currículo. Boa sorte!<br><br><span style="font-size:2.5rem;font-weight:800;color:#64ffda">' + countdown + '</span>';
            }
        }, 1000);
    }

    /* ─── Dodge Button Logic ─── */
    let dodgeHandler = null;

    function enableDodge(btn) {
        disableDodge();

        dodgeHandler = (e) => {
            const rect = btn.getBoundingClientRect();
            const dx = e.clientX - (rect.left + rect.width / 2);
            const dy = e.clientY - (rect.top + rect.height / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 100) {
                // Switch to absolute positioning on first dodge
                btn.style.position = 'absolute';

                // Flee in opposite direction from mouse
                const modalBox = btn.closest('.fun-modal-box');
                const boxRect = modalBox.getBoundingClientRect();

                // Random flee position within the modal box
                const maxX = boxRect.width - btn.offsetWidth - 20;
                const maxY = boxRect.height - btn.offsetHeight - 20;

                let newX = 10 + Math.random() * maxX;
                let newY = 10 + Math.random() * maxY;

                btn.style.left = newX + 'px';
                btn.style.top = newY + 'px';
            }
        };

        document.addEventListener('mousemove', dodgeHandler);
    }

    function disableDodge() {
        if (dodgeHandler) {
            document.removeEventListener('mousemove', dodgeHandler);
            dodgeHandler = null;
        }
    }

    /* ═══════════════════════════════════════
       DINO GAME (T-Rex Runner)
       ═══════════════════════════════════════ */
    let dinoGame = null;

    function startDinoGameReveal() {
        const banner = document.getElementById('funRevealBanner');
        banner.classList.add('active');

        // Hide sections after Habilidades
        hideSectionsAfterHabilidades();

        // Init the dino game
        const canvas = document.getElementById('funDinoCanvas');
        dinoGame = new DinoGame(canvas, onDinoScore);

        const instructions = document.querySelector('.fun-dino-instructions');
        if (instructions) {
            instructions.textContent = '🎮 Pressione ESPAÇO ou clique para pular!';
        }
    }

    function hideSectionsAfterHabilidades() {
        // Hide everything after "03 Habilidades"
        const sectionsToHide = ['experiencia', 'projetos'];
        sectionsToHide.forEach(id => {
            const section = document.getElementById(id);
            if (section) {
                section.style.display = 'none';
            }
        });
        const gallery = document.querySelector('.gallery-section');
        if (gallery) gallery.style.display = 'none';
        const footer = document.querySelector('footer');
        if (footer) footer.style.display = 'none';
    }

    function onDinoScore(score) {
        const fill = document.getElementById('funRevealFill');
        const targetScore = 350;
        const pct = Math.min(100, (score / targetScore) * 100);
        fill.style.width = pct + '%';

        const dinoScreen = document.getElementById('funDinoScreen');

        if (pct > 0) {
            const dinoOpacity = Math.max(0.3, 1 - (pct / 100) * 0.7);
            dinoScreen.style.opacity = dinoOpacity;
        }

        if (pct >= 100) {
            setTimeout(() => {
                dinoScreen.style.transition = 'opacity 1s ease';
                dinoScreen.style.opacity = '0';

                const banner = document.getElementById('funRevealBanner');
                banner.style.transition = 'opacity 1s ease';
                banner.style.opacity = '0';

                setTimeout(() => {
                    dinoScreen.classList.remove('active');
                    dinoScreen.style.display = 'none';
                    banner.style.display = 'none';
                    document.body.style.overflow = '';
                    if (dinoGame) dinoGame.stop();
                    // Show 50% modal then setup Phase 2
                    showFunModal('50% do currículo liberado! 🎉', () => {
                        setupPhase2();
                    });
                }, 1000);
            }, 500);
        }
    }

    /* ═══════════════════════════════════════
       PHASE 2 — Locked Nav + Hater Game
       ═══════════════════════════════════════ */
    let phase2Active = false;
    let bangTriggered = false;

    function setupPhase2() {
        phase2Active = true;

        // Intercept clicks on locked nav links
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === '#experiencia' || href === '#projetos') {
                link.addEventListener('click', (e) => {
                    if (phase2Active) {
                        e.preventDefault();
                        showFunModal('Calma apressadinho, ainda não chegamos lá! Role a página e aproveite o que já conquistou. 😉');
                    }
                });
            }
        });

        // Listen for scroll to bottom
        window.addEventListener('scroll', onPhase2Scroll);
    }

    function onPhase2Scroll() {
        if (bangTriggered) return;
        const nearBottom = (window.innerHeight + window.pageYOffset) >= (document.body.scrollHeight - 150);
        if (nearBottom) {
            bangTriggered = true;
            window.removeEventListener('scroll', onPhase2Scroll);
            showBangExplosion();
        }
    }

    function showFunModal(message, callback) {
        const overlay = document.getElementById('funModalOverlay');
        const emoji = document.getElementById('funModalEmoji');
        const text = document.getElementById('funModalText');
        const dodgeBtn = document.getElementById('funDodgeBtn');
        const nextBtn = document.getElementById('funNextBtn');

        emoji.textContent = '';
        text.textContent = message;
        dodgeBtn.style.display = 'none';
        nextBtn.textContent = 'OK';
        nextBtn.style.display = '';
        overlay.classList.add('active');

        nextBtn.onclick = () => {
            overlay.classList.remove('active');
            nextBtn.textContent = 'Próximo →';
            if (callback) callback();
        };
    }

    /* ─── BANG Explosion ─── */
    function showBangExplosion() {
        // Create BANG overlay
        const bang = document.createElement('div');
        bang.id = 'funBangOverlay';
        bang.innerHTML = '<span class="fun-bang-text">BANG!</span>';
        document.body.appendChild(bang);

        // Animate
        requestAnimationFrame(() => {
            bang.classList.add('active');
        });

        // Remove after animation and show modal
        setTimeout(() => {
            bang.classList.remove('active');
            setTimeout(() => {
                bang.remove();
                showFunModal('Você encontrou Haters em 50% do meu currículo! Estão atirando em você! Atire de volta rápido antes que te acertem!', () => {
                    startHaterGame();
                });
            }, 300);
        }, 1200);
    }

    let haterHits = 0;
    let haterMisses = 0;
    let haterGameRunning = false;
    let haterTimer = null;
    let haterDeaths = 0;
    let autoHelpMode = false;
    let autoHelpTriggered = false;

    function startHaterGame() {
        haterHits = 0;
        haterMisses = 0;
        haterGameRunning = true;
        autoHelpTriggered = false;
        document.body.style.overflow = 'hidden';

        // Create game overlay
        let gameOverlay = document.getElementById('funHaterGameOverlay');
        if (!gameOverlay) {
            gameOverlay = document.createElement('div');
            gameOverlay.id = 'funHaterGameOverlay';
            gameOverlay.className = 'fun-hater-overlay';
            gameOverlay.innerHTML = `
                <div class="fun-hater-hud">
                    <span class="fun-hater-score">🎯 Acertos: <strong id="haterHitCount">0</strong>/5</span>
                    <span class="fun-hater-lives">❤️ Vidas: <strong id="haterLivesCount">3</strong></span>
                </div>
            `;
            document.body.appendChild(gameOverlay);

            gameOverlay.addEventListener('click', (e) => {
                if (e.target === gameOverlay || e.target.classList.contains('fun-hater-hud')) {
                    // Don't count clicks on HUD as misses
                }
            });
        }

        gameOverlay.classList.add('active');
        updateHaterHUD();
        spawnHater();
    }

    function spawnHater() {
        if (!haterGameRunning) return;

        const overlay = document.getElementById('funHaterGameOverlay');
        if (!overlay) return;

        // Remove old haters
        overlay.querySelectorAll('.fun-hater-target').forEach(h => h.remove());

        const hater = document.createElement('img');
        hater.src = 'assets/img/hater.png';
        hater.className = 'fun-hater-target';
        hater.draggable = false;

        // Random size between 60px and 120px
        const size = 60 + Math.random() * 60;
        hater.style.width = size + 'px';
        hater.style.height = size + 'px';

        // Random position (keeping within viewport)
        const maxX = window.innerWidth - size - 40;
        const maxY = window.innerHeight - size - 100;
        hater.style.left = (40 + Math.random() * maxX) + 'px';
        hater.style.top = (60 + Math.random() * maxY) + 'px';

        // Click = hit!
        hater.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!haterGameRunning) return;
            haterHits++;
            hater.classList.add('hit');
            updateHaterHUD();

            if (haterHits >= 5) {
                haterGameRunning = false;
                clearTimeout(haterTimer);
                setTimeout(() => winHaterGame(), 500);
            } else {
                clearTimeout(haterTimer);
                setTimeout(() => spawnHater(), 400);
            }
        });

        overlay.appendChild(hater);

        // Auto-disappear — time decreases with each hit
        const haterTimes = [2000, 1600, 1200, 800, 300];
        const visibleTime = haterTimes[Math.min(haterHits, haterTimes.length - 1)];
        haterTimer = setTimeout(() => {
            if (!haterGameRunning) return;
            hater.classList.add('missed');
            haterMisses++;
            updateHaterHUD();

            if (haterMisses >= 3) {
                haterGameRunning = false;
                clearTimeout(haterTimer);
                setTimeout(() => loseHaterGame(), 500);
            } else {
                setTimeout(() => spawnHater(), 400);
            }
        }, visibleTime);
    }

    function updateHaterHUD() {
        const hits = document.getElementById('haterHitCount');
        const lives = document.getElementById('haterLivesCount');
        if (hits) hits.textContent = haterHits;
        if (lives) lives.textContent = (3 - haterMisses);
    }

    function loseHaterGame() {
        const overlay = document.getElementById('funHaterGameOverlay');
        overlay.querySelectorAll('.fun-hater-target').forEach(h => h.remove());
        overlay.classList.remove('active');
        haterDeaths++;

        if (haterDeaths >= 2) {
            // 2nd death — show help modal, then execute bangbang immediately
            showFunModal('Aqui, deixa eu te ajudar', () => {
                // Re-activate overlay and trigger bangbang directly
                overlay.classList.add('active');
                haterGameRunning = true;
                triggerBangBangHelp();
            });
        } else {
            showFunModal('Você morreu! Tente novamente. 💀', () => {
                startHaterGame();
            });
        }
    }

    /* ─── Auto-Help: BangBang gun explosion ─── */
    function triggerBangBangHelp() {
        haterGameRunning = false;
        clearTimeout(haterTimer);

        const overlay = document.getElementById('funHaterGameOverlay');

        // Remove any existing haters
        overlay.querySelectorAll('.fun-hater-target').forEach(h => h.remove());

        // Create gun in bottom-right
        const gun = document.createElement('img');
        gun.src = 'assets/img/bangbang.png';
        gun.className = 'fun-autohelp-gun';
        document.body.appendChild(gun);

        // Animate gun sliding up
        requestAnimationFrame(() => {
            gun.classList.add('visible');
        });

        // After gun appears, FIRE!
        setTimeout(() => {
            // Gunshot flash
            const flash = document.createElement('div');
            flash.className = 'fun-gunshot-flash';
            document.body.appendChild(flash);

            // Shockwave explosion from center
            const shockwave = document.createElement('div');
            shockwave.className = 'fun-shockwave';
            document.body.appendChild(shockwave);

            // Spawn 3 haters being destroyed by the explosion
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    const deadHater = document.createElement('img');
                    deadHater.src = 'assets/img/hater.png';
                    deadHater.className = 'fun-hater-target';
                    deadHater.draggable = false;
                    const sz = 60 + Math.random() * 50;
                    deadHater.style.width = sz + 'px';
                    deadHater.style.height = sz + 'px';
                    deadHater.style.left = (100 + Math.random() * (window.innerWidth - 250)) + 'px';
                    deadHater.style.top = (100 + Math.random() * (window.innerHeight - 300)) + 'px';
                    overlay.appendChild(deadHater);
                    // Immediately explode it
                    setTimeout(() => {
                        deadHater.classList.add('hit');
                    }, 100);
                }, i * 200);
            }

            // Clean up and win
            setTimeout(() => {
                flash.remove();
                shockwave.remove();
                gun.classList.remove('visible');
                setTimeout(() => {
                    gun.remove();
                    overlay.querySelectorAll('.fun-hater-target').forEach(h => h.remove());
                    // Set hits to 5 for the win
                    haterHits = 5;
                    updateHaterHUD();
                    setTimeout(() => winHaterGame(), 300);
                }, 500);
            }, 1200);
        }, 1000);
    }

    function winHaterGame() {
        const overlay = document.getElementById('funHaterGameOverlay');
        overlay.querySelectorAll('.fun-hater-target').forEach(h => h.remove());
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        phase2Active = false;

        showFunModal('Pronto, derrotamos todos eles! Juntos fazemos uma equipe incrível! Que tal tornarmos essa equipe realidade? Você conquistou a oportunidade de visualizar 100% do meu currículo, aproveite! Espero que retribua me dando a oportunidade de ingressar na sua equipe! 🎉', () => {
            revealAllSections();
        });
    }

    function revealAllSections() {
        const sectionsToShow = ['experiencia', 'projetos'];
        sectionsToShow.forEach(id => {
            const section = document.getElementById(id);
            if (section) {
                section.style.display = '';
                section.style.animation = 'funFadeIn 0.8s ease forwards';
            }
        });
        const gallery = document.querySelector('.gallery-section');
        if (gallery) { gallery.style.display = ''; gallery.style.animation = 'funFadeIn 0.8s ease forwards'; }
        const footer = document.querySelector('footer');
        if (footer) { footer.style.display = ''; footer.style.animation = 'funFadeIn 0.8s ease forwards'; }
    }

    /* ─── Dino Game Class (Delta-Time Based) ─── */
    class DinoGame {
        constructor(canvas, onScore) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.onScore = onScore;
            this.running = false;
            this.score = 0;
            this.speed = 490; // pixels per second
            this.elapsed = 0; // total elapsed time in seconds
            this.lastTime = 0;
            this.scoreAccum = 0;
            this.obstacleAccum = 0;

            // Set canvas size
            this.canvas.width = 700;
            this.canvas.height = 200;

            // Dino
            this.dino = {
                x: 60,
                y: 160,
                w: 40,
                h: 44,
                vy: 0,
                jumping: false,
                grounded: true
            };

            // Obstacles
            this.obstacles = [];

            // Ground
            this.groundOffset = 0;

            // Dino sprite
            this.dinoImg = new Image();
            this.dinoImg.src = 'assets/img/dinossauro-olimpic.png';

            // Leg animation
            this.legTimer = 0;
            this.legFrame = false;

            // Input
            this.boundKeyDown = this.handleKey.bind(this);
            this.boundTouchStart = this.handleTouch.bind(this);
            document.addEventListener('keydown', this.boundKeyDown);
            canvas.addEventListener('click', this.boundTouchStart);

            // Start
            this.running = true;
            this.gameOver = false;
            this.lastTime = performance.now();
            this.loop();
        }

        handleKey(e) {
            if ((e.code === 'Space' || e.code === 'ArrowUp') && this.dino.grounded) {
                e.preventDefault();
                this.jump();
            }
            if (this.gameOver && (e.code === 'Space' || e.code === 'ArrowUp')) {
                e.preventDefault();
                this.restart();
            }
        }

        handleTouch() {
            if (this.dino.grounded && !this.gameOver) {
                this.jump();
            } else if (this.gameOver) {
                this.restart();
            }
        }

        jump() {
            this.dino.vy = -750; // pixels per second upward
            this.dino.jumping = true;
            this.dino.grounded = false;
        }

        restart() {
            this.score = Math.max(this.score, 0);
            this.obstacles = [];
            this.obstacleAccum = 0;
            this.dino.y = 160;
            this.dino.vy = 0;
            this.dino.grounded = true;
            this.dino.jumping = false;
            this.gameOver = false;
            this.speed = 490;
            this.lastTime = performance.now();
            this.loop();
        }

        stop() {
            this.running = false;
            document.removeEventListener('keydown', this.boundKeyDown);
            this.canvas.removeEventListener('click', this.boundTouchStart);
        }

        loop(timestamp) {
            if (!this.running) return;

            if (!timestamp) timestamp = performance.now();
            let dt = (timestamp - this.lastTime) / 1000; // delta in seconds
            this.lastTime = timestamp;

            // Clamp dt to avoid huge jumps (e.g. tab switch)
            if (dt > 0.1) dt = 0.016;

            if (this.gameOver) {
                this.drawGameOver();
                return;
            }

            this.update(dt);
            this.draw();
            requestAnimationFrame((t) => this.loop(t));
        }

        update(dt) {
            this.elapsed += dt;

            // Dino physics
            if (!this.dino.grounded) {
                this.dino.vy += 2400 * dt; // gravity (px/s²)
                this.dino.y += this.dino.vy * dt;

                if (this.dino.y >= 160) {
                    this.dino.y = 160;
                    this.dino.vy = 0;
                    this.dino.grounded = true;
                    this.dino.jumping = false;
                }
            }

            // Leg animation timer
            this.legTimer += dt;
            if (this.legTimer > 0.1) {
                this.legTimer = 0;
                this.legFrame = !this.legFrame;
            }

            // Obstacles — spawn based on time
            this.obstacleAccum += dt;
            const minInterval = Math.max(0.6, 1.2 - (this.speed - 490) * 0.002);
            if (this.obstacleAccum > minInterval + Math.random() * 0.4) {
                const h = 20 + Math.random() * 25;
                this.obstacles.push({
                    x: this.canvas.width,
                    y: 204 - h,
                    w: 15 + Math.random() * 12,
                    h: h
                });
                this.obstacleAccum = 0;
            }

            // Move obstacles
            for (let i = this.obstacles.length - 1; i >= 0; i--) {
                this.obstacles[i].x -= this.speed * dt;
                if (this.obstacles[i].x + this.obstacles[i].w < 0) {
                    this.obstacles.splice(i, 1);
                }
            }

            // Collision
            for (const obs of this.obstacles) {
                if (
                    this.dino.x + 8 < obs.x + obs.w &&
                    this.dino.x + this.dino.w - 8 > obs.x &&
                    this.dino.y + 8 < obs.y + obs.h &&
                    this.dino.y + this.dino.h > obs.y
                ) {
                    this.gameOver = true;
                    return;
                }
            }

            // Score — 1 point every ~0.13 seconds (same as old 8 frames at 60fps)
            this.scoreAccum += dt;
            if (this.scoreAccum >= 0.133) {
                this.scoreAccum -= 0.133;
                this.score++;
                this.onScore(this.score);
            }

            // Speed increase — ramp smoothly from base to 2x based on score progress
            const baseSpeed = 490;
            const maxSpeed = baseSpeed * 1.6; // 784 px/s (20% less than 2x)
            const progress = Math.min(1, this.score / 350); // 350 = targetScore
            this.speed = baseSpeed + (maxSpeed - baseSpeed) * progress;

            // Ground scroll
            this.groundOffset = (this.groundOffset + this.speed * dt) % 20;
        }

        draw() {
            const ctx = this.ctx;
            const W = this.canvas.width;
            const H = this.canvas.height;

            ctx.fillStyle = '#f7f7f7';
            ctx.fillRect(0, 0, W, H);

            // Ground
            ctx.strokeStyle = '#ccc';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, 204);
            ctx.lineTo(W, 204);
            ctx.stroke();

            // Ground texture
            ctx.fillStyle = '#ddd';
            for (let i = -this.groundOffset; i < W; i += 20) {
                ctx.fillRect(i, 206, 8, 1);
            }

            // Dino sprite
            const d = this.dino;
            if (this.dinoImg.complete && this.dinoImg.naturalWidth > 0) {
                ctx.drawImage(this.dinoImg, d.x - 10, d.y - 20, 60, 64);
            } else {
                ctx.fillStyle = '#535353';
                ctx.fillRect(d.x, d.y, d.w, d.h);
            }

            // Obstacles (cacti)
            ctx.fillStyle = '#535353';
            for (const obs of this.obstacles) {
                ctx.fillRect(obs.x + 2, obs.y, obs.w - 4, obs.h);
                if (obs.w > 20) {
                    ctx.fillRect(obs.x - 4, obs.y + 8, 8, 4);
                    ctx.fillRect(obs.x + obs.w - 4, obs.y + 12, 8, 4);
                }
            }

            // Score display
            ctx.fillStyle = '#555';
            ctx.font = 'bold 14px Courier New';
            ctx.textAlign = 'right';
            ctx.fillText('Score: ' + String(this.score).padStart(5, '0'), W - 10, 20);
        }

        drawGameOver() {
            this.draw();
            const ctx = this.ctx;
            const W = this.canvas.width;

            ctx.fillStyle = 'rgba(247, 247, 247, 0.6)';
            ctx.fillRect(0, 0, W, this.canvas.height);

            ctx.fillStyle = '#535353';
            ctx.font = 'bold 20px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', W / 2, 90);

            ctx.font = '14px Courier New';
            ctx.fillText('Pressione ESPAÇO para continuar', W / 2, 120);
        }
    }

    /* ─── Footer Replay Buttons ─── */
    document.addEventListener('DOMContentLoaded', () => {
        const replayDino = document.getElementById('funReplayDino');
        const replayHater = document.getElementById('funReplayHater');

        if (replayDino) {
            replayDino.addEventListener('click', () => {
                replayDinoGame();
            });
        }

        if (replayHater) {
            replayHater.addEventListener('click', () => {
                replayHaterGame();
            });
        }
    });

    function replayDinoGame() {
        // Stop any existing game
        if (dinoGame) dinoGame.stop();
        document.body.style.overflow = 'hidden';
        window.scrollTo(0, 0);

        // Step 1: Show fake offline screen
        const dinoScreen = document.getElementById('funDinoScreen');
        if (dinoScreen) {
            dinoScreen.style.display = '';
            dinoScreen.style.transition = '';
            dinoScreen.style.opacity = '1';
            dinoScreen.classList.add('active');
        }

        // Also reset the banner
        const banner = document.getElementById('funRevealBanner');
        if (banner) {
            banner.style.display = '';
        }

        // Step 2: After 4 seconds, show countdown modal
        setTimeout(() => {
            showReplayCountdown();
        }, 4000);
    }

    function showReplayCountdown() {
        const overlay = document.getElementById('funModalOverlay');
        const emoji = document.getElementById('funModalEmoji');
        const text = document.getElementById('funModalText');
        const dodgeBtn = document.getElementById('funDodgeBtn');
        const nextBtn = document.getElementById('funNextBtn');

        dodgeBtn.style.display = 'none';
        nextBtn.style.display = 'none';

        emoji.innerHTML = '<img src="assets/img/dinossauro-olimpic.png" style="width:100px;height:100px;object-fit:contain;display:block;margin:0 auto">';
        let countdown = 5;
        text.innerHTML = 'Avance no jogo do dinossauro para liberar mais partes do meu currículo. Boa sorte!<br><br><span style="font-size:2.5rem;font-weight:800;color:#667eea">' + countdown + '</span>';

        overlay.classList.add('active');

        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                overlay.classList.remove('active');
                nextBtn.style.display = '';
                startReplayDinoGame();
            } else {
                text.innerHTML = 'Avance no jogo do dinossauro para liberar mais partes do meu currículo. Boa sorte!<br><br><span style="font-size:2.5rem;font-weight:800;color:#64ffda">' + countdown + '</span>';
            }
        }, 1000);
    }

    function startReplayDinoGame() {
        // Show progress banner
        let banner = document.getElementById('funRevealBanner');
        if (banner) {
            banner.classList.add('active');
            banner.style.opacity = '1';
            banner.style.transition = '';
            const fill = document.getElementById('funRevealFill');
            if (fill) fill.style.width = '0%';
        }

        const dinoScreen = document.getElementById('funDinoScreen');
        const canvas = document.getElementById('funDinoCanvas');
        dinoGame = new DinoGame(canvas, (score) => {
            const fill = document.getElementById('funRevealFill');
            const pct = Math.min(100, (score / 350) * 100);
            if (fill) fill.style.width = pct + '%';

            if (pct > 0 && dinoScreen) {
                dinoScreen.style.opacity = Math.max(0.3, 1 - (pct / 100) * 0.7);
            }

            if (pct >= 100) {
                setTimeout(() => {
                    if (dinoScreen) {
                        dinoScreen.style.transition = 'opacity 1s ease';
                        dinoScreen.style.opacity = '0';
                    }
                    if (banner) {
                        banner.style.transition = 'opacity 1s ease';
                        banner.style.opacity = '0';
                    }
                    setTimeout(() => {
                        if (dinoScreen) dinoScreen.classList.remove('active');
                        document.body.style.overflow = '';
                        if (dinoGame) dinoGame.stop();
                    }, 1000);
                }, 500);
            }
        });
    }

    function replayHaterGame() {
        haterDeaths = 0;
        autoHelpMode = false;
        bangTriggered = false;
        showBangExplosion();
    }

})();
