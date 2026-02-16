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
            entryOverlay.classList.add('hidden');
            setTimeout(() => {
                entryOverlay.remove();
                startFunSequence();
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
            text: 'HAHA aposto que quem não apertou antes, tentou agora! Prometo que vou liberar esse botão em breve, mas vamos continuar.',
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
        const targetScore = 800;
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
                    dinoScreen.remove();
                    banner.remove();
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

    /* ─── Hater Shooting Game ─── */
    let haterHits = 0;
    let haterMisses = 0;
    let haterGameRunning = false;
    let haterTimer = null;

    function startHaterGame() {
        haterHits = 0;
        haterMisses = 0;
        haterGameRunning = true;
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

            // Clicking the background = miss
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

        // Auto-disappear — time decreases with each hit (2s → min 0.5s)
        const haterTimes = [2000, 1600, 1200, 800, 700];
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

        showFunModal('Você morreu! Tente novamente. 💀', () => {
            startHaterGame();
        });
    }

    function winHaterGame() {
        const overlay = document.getElementById('funHaterGameOverlay');
        overlay.querySelectorAll('.fun-hater-target').forEach(h => h.remove());
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        phase2Active = false;

        showFunModal('Parabéns! Você derrotou todos os Haters! 🎉 Agora pode explorar o restante do meu currículo.', () => {
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

    /* ─── Dino Game Class ─── */
    class DinoGame {
        constructor(canvas, onScore) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.onScore = onScore;
            this.running = false;
            this.score = 0;
            this.speed = 2.5;
            this.frameCount = 0;

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
            this.obstacleTimer = 0;

            // Ground
            this.groundOffset = 0;

            // Dino sprite
            this.dinoImg = new Image();
            this.dinoImg.src = 'assets/img/dinossauro-olimpic.png';

            // Input
            this.boundKeyDown = this.handleKey.bind(this);
            this.boundTouchStart = this.handleTouch.bind(this);
            document.addEventListener('keydown', this.boundKeyDown);
            canvas.addEventListener('click', this.boundTouchStart);

            // Start
            this.running = true;
            this.gameOver = false;
            this.loop();
        }

        handleKey(e) {
            if ((e.code === 'Space' || e.code === 'ArrowUp') && this.dino.grounded) {
                e.preventDefault();
                this.jump();
            }
            // Restart on game over
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
            this.dino.vy = -10;
            this.dino.jumping = true;
            this.dino.grounded = false;
        }

        restart() {
            this.score = Math.max(this.score, 0);
            this.obstacles = [];
            this.obstacleTimer = 0;
            this.dino.y = 160;
            this.dino.vy = 0;
            this.dino.grounded = true;
            this.dino.jumping = false;
            this.gameOver = false;
            this.speed = 2.5;
            this.loop();
        }

        stop() {
            this.running = false;
            document.removeEventListener('keydown', this.boundKeyDown);
            this.canvas.removeEventListener('click', this.boundTouchStart);
        }

        loop() {
            if (!this.running) return;
            if (this.gameOver) {
                this.drawGameOver();
                return;
            }

            this.update();
            this.draw();
            requestAnimationFrame(() => this.loop());
        }

        update() {
            this.frameCount++;

            // Dino physics
            if (!this.dino.grounded) {
                this.dino.vy += 0.5; // gravity (softer)
                this.dino.y += this.dino.vy;

                if (this.dino.y >= 160) {
                    this.dino.y = 160;
                    this.dino.vy = 0;
                    this.dino.grounded = true;
                    this.dino.jumping = false;
                }
            }

            // Obstacles — wider spacing
            this.obstacleTimer++;
            const minInterval = Math.max(60, 100 - this.speed * 3);
            if (this.obstacleTimer > minInterval + Math.random() * 50) {
                const h = 20 + Math.random() * 25;
                this.obstacles.push({
                    x: this.canvas.width,
                    y: 204 - h,
                    w: 15 + Math.random() * 12,
                    h: h
                });
                this.obstacleTimer = 0;
            }

            // Move obstacles
            for (let i = this.obstacles.length - 1; i >= 0; i--) {
                this.obstacles[i].x -= this.speed;
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

            // Score
            if (this.frameCount % 8 === 0) {
                this.score++;
                this.onScore(this.score);
            }

            // Speed increase (slower ramp)
            if (this.frameCount % 500 === 0) {
                this.speed += 0.2;
            }

            // Ground scroll
            this.groundOffset = (this.groundOffset + this.speed) % 20;
        }

        draw() {
            const ctx = this.ctx;
            const W = this.canvas.width;
            const H = this.canvas.height;

            // Clear
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
                // Fallback rectangle
                ctx.fillStyle = '#535353';
                ctx.fillRect(d.x, d.y, d.w, d.h);
            }

            // Obstacles (cacti)
            ctx.fillStyle = '#535353';
            for (const obs of this.obstacles) {
                // Main trunk
                ctx.fillRect(obs.x + 2, obs.y, obs.w - 4, obs.h);
                // Arms
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

})();
