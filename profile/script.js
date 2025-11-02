document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const skillFills = document.querySelectorAll('.skill-fill');
    const statNumbers = document.querySelectorAll('.stat-number');
    const contactForm = document.querySelector('.contact-form');

    function switchTab(targetTab) {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        const activeButton = document.querySelector(`[data-tab="${targetTab}"]`);
        const activeContent = document.getElementById(targetTab);

        if (activeButton && activeContent) {
            activeButton.classList.add('active');
            activeContent.classList.add('active');

            if (targetTab === 'skills') {
                setTimeout(animateSkills, 300);
            }
        }
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });

    function animateSkills() {
        skillFills.forEach(fill => {
            const targetWidth = fill.getAttribute('data-width');
            fill.style.width = targetWidth + '%';
        });
    }

    function animateCounters() {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                stat.textContent = Math.floor(current);
            }, 16);
        });
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('stats-card')) {
                    animateCounters();
                    observer.unobserve(entry.target);
                }
            }
        });
    });

    const statsCard = document.querySelector('.stats-card');
    if (statsCard) {
        observer.observe(statsCard);
    }

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const name = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const message = this.querySelector('textarea').value;

            if (name && email && message) {
                showNotification('Message sent successfully! 🎉', 'success');
                this.reset();
            } else {
                showNotification('Please fill in all fields! 📝', 'error');
            }
        });
    }

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            ${type === 'success' ? 'background: #27AE60;' : 'background: #E74C3C;'}
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    const profileCard = document.querySelector('.profile-card');
    if (profileCard) {
        profileCard.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });

        profileCard.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    }

    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.borderLeftColor = '#7B68EE';
            this.style.borderLeftWidth = '8px';
        });

        card.addEventListener('mouseleave', function() {
            this.style.borderLeftColor = '#4A90E2';
            this.style.borderLeftWidth = '5px';
        });
    });

    function addFloatingElements() {
        const hero = document.querySelector('.hero');
        const shapes = ['circle', 'triangle', 'square'];

        for (let i = 0; i < 5; i++) {
            const shape = document.createElement('div');
            shape.className = `floating-shape ${shapes[Math.floor(Math.random() * shapes.length)]}`;

            shape.style.cssText = `
                position: absolute;
                width: ${Math.random() * 20 + 10}px;
                height: ${Math.random() * 20 + 10}px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float ${Math.random() * 3 + 2}s ease-in-out infinite;
                animation-delay: ${Math.random() * 2}s;
            `;

            hero.appendChild(shape);
        }
    }

    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
        }

        .notification {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .floating-shape {
            pointer-events: none;
        }

        .tab-content {
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.5s ease;
        }

        .tab-content.active {
            opacity: 1;
            transform: translateY(0);
        }

        .skill-fill {
            position: relative;
            overflow: hidden;
        }

        .skill-fill::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
            animation: shimmer 2s ease-in-out infinite;
        }

        @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
        }
    `;
    document.head.appendChild(style);

    addFloatingElements();

    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector('.hero');
        const speed = scrolled * 0.5;

        if (parallax) {
            parallax.style.transform = `translateY(${speed}px)`;
        }
    });

    const elements = document.querySelectorAll('.project-card, .skill-category, .contact-info');
    const slideInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });

    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        slideInObserver.observe(el);
    });
});

// ========== 10 EPIC FULLSCREEN GAMES ==========

// Fullscreen functionality
function toggleFullscreen(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!document.fullscreenElement) {
        canvas.requestFullscreen().then(() => {
            // Resize canvas to fullscreen
            canvas.width = window.screen.width;
            canvas.height = window.screen.height;
            canvas.style.width = '100vw';
            canvas.style.height = '100vh';
        }).catch(err => {
            console.log('Fullscreen failed:', err);
        });
    } else {
        document.exitFullscreen().then(() => {
            // Reset canvas size
            canvas.width = 400;
            canvas.height = 300;
            canvas.style.width = '400px';
            canvas.style.height = '300px';
        });
    }
}

// ========== 1. NEON SNAKE ARENA ==========
let snakeCtx, snakeRunning = false;
let snake = { body: [{x: 200, y: 150}], direction: {x: 0, y: 0}, growing: false };
let snakeFood = { x: 0, y: 0, type: 'normal' };
let snakeScore = 0;
let snakeSpeed = 8;
let snakeKeys = {};

function startBrawlStars() {
    const canvas = document.getElementById('brawlStarsGame');
    brawlStarsCtx = canvas.getContext('2d');
    brawlStarsRunning = true;

    // Reset game state
    player = { x: 200, y: 150, size: 18, health: 100, score: 0, lives: 3 };
    enemies = [];
    projectiles = [];
    particles = [];
    powerUps = [];
    keys = {};

    // Create tougher enemies
    for(let i = 0; i < 6; i++) {
        enemies.push({
            x: Math.random() * 350 + 25,
            y: Math.random() * 250 + 25,
            size: 15 + Math.random() * 8,
            health: 75 + Math.random() * 50,
            maxHealth: 75 + Math.random() * 50,
            speed: 0.8 + Math.random() * 1.2,
            angle: Math.random() * Math.PI * 2,
            shootTimer: 0,
            type: ['basic', 'heavy', 'fast'][Math.floor(Math.random() * 3)]
        });
    }

    brawlStarsGameLoop();
    document.addEventListener('keydown', handleBrawlKeyDown);
    document.addEventListener('keyup', handleBrawlKeyUp);
}

function brawlStarsGameLoop() {
    if(!brawlStarsRunning) return;

    // Dynamic background with moving energy
    const gradient = brawlStarsCtx.createRadialGradient(200, 150, 0, 200, 150, 250);
    gradient.addColorStop(0, 'rgba(20, 30, 60, 0.8)');
    gradient.addColorStop(1, 'rgba(5, 10, 25, 0.9)');
    brawlStarsCtx.fillStyle = gradient;
    brawlStarsCtx.fillRect(0, 0, 400, 300);

    // Animated grid system
    const time = Date.now() * 0.001;
    brawlStarsCtx.strokeStyle = `rgba(0, 255, 255, ${0.1 + Math.sin(time) * 0.05})`;
    brawlStarsCtx.lineWidth = 1;
    for(let i = 0; i < 400; i += 25) {
        brawlStarsCtx.beginPath();
        brawlStarsCtx.moveTo(i + Math.sin(time + i * 0.01) * 3, 0);
        brawlStarsCtx.lineTo(i + Math.sin(time + i * 0.01) * 3, 300);
        brawlStarsCtx.stroke();
    }
    for(let i = 0; i < 300; i += 25) {
        brawlStarsCtx.beginPath();
        brawlStarsCtx.moveTo(0, i + Math.cos(time + i * 0.01) * 2);
        brawlStarsCtx.lineTo(400, i + Math.cos(time + i * 0.01) * 2);
        brawlStarsCtx.stroke();
    }

    // Handle continuous movement
    handleBrawlMovement();

    // Update all game systems
    updateBrawlEnemies();
    updateBrawlProjectiles();
    updateParticles();
    updatePowerUps();
    spawnEnemies();
    spawnPowerUps();

    // Draw everything with enhanced graphics
    drawBrawl3DPlayer();
    drawBrawl3DEnemies();
    drawBrawlProjectiles();
    drawPowerUps();
    drawBrawlUI();

    // Check game over
    if(player.health <= 0 && player.lives > 0) {
        player.lives--;
        player.health = 100;
        createMegaExplosion(player.x, player.y);
    }

    if(player.lives <= 0) {
        gameOver();
        return;
    }

    requestAnimationFrame(brawlStarsGameLoop);
}

// New key handling system for letter-based shooting
function handleBrawlKeyDown(e) {
    keys[e.key.toLowerCase()] = true;

    // Letter-based shooting system
    const shootKeys = ['q', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'f', 'g', 'h', 'j', 'k', 'l', 'z', 'x', 'c', 'v', 'b', 'n', 'm'];

    if(shootKeys.includes(e.key.toLowerCase())) {
        shootInDirection(e.key.toLowerCase());
    }
}

function handleBrawlKeyUp(e) {
    keys[e.key.toLowerCase()] = false;
}

function handleBrawlMovement() {
    const speed = 4;
    if(keys['w'] && player.y > player.size) player.y -= speed;
    if(keys['s'] && player.y < 300 - player.size) player.y += speed;
    if(keys['a'] && player.x > player.size) player.x -= speed;
    if(keys['d'] && player.x < 400 - player.size) player.x += speed;
}

function shootInDirection(key) {
    // Each letter shoots in a different direction with unique properties
    const directions = {
        'q': { angle: -Math.PI * 3/4, color: '#FF6B6B', damage: 30, speed: 6 },
        'w': { angle: -Math.PI/2, color: '#4ECDC4', damage: 25, speed: 8 },
        'e': { angle: -Math.PI/4, color: '#45B7D1', damage: 30, speed: 6 },
        'r': { angle: 0, color: '#96CEB4', damage: 35, speed: 7 },
        't': { angle: Math.PI/4, color: '#FFEAA7', damage: 30, speed: 6 },
        'y': { angle: Math.PI/2, color: '#DDA0DD', damage: 25, speed: 8 },
        'u': { angle: Math.PI * 3/4, color: '#98D8C8', damage: 30, speed: 6 },
        'i': { angle: Math.PI, color: '#F7DC6F', damage: 35, speed: 7 },
        'o': { angle: -Math.PI * 3/4, color: '#BB8FCE', damage: 30, speed: 6 },
        'p': { angle: -Math.PI/2, color: '#85C1E9', damage: 25, speed: 8 },
        'f': { angle: -Math.PI/6, color: '#F8C471', damage: 40, speed: 5 },
        'g': { angle: Math.PI/6, color: '#82E0AA', damage: 40, speed: 5 },
        'h': { angle: Math.PI/3, color: '#F1948A', damage: 40, speed: 5 },
        'j': { angle: Math.PI * 2/3, color: '#85C1E9', damage: 40, speed: 5 },
        'k': { angle: Math.PI * 5/6, color: '#D2B4DE', damage: 40, speed: 5 },
        'l': { angle: -Math.PI/3, color: '#A9DFBF', damage: 40, speed: 5 },
        'z': { angle: Math.PI/8, color: '#FFD93D', damage: 50, speed: 9 },
        'x': { angle: Math.PI * 3/8, color: '#6BCF7F', damage: 50, speed: 9 },
        'c': { angle: Math.PI * 5/8, color: '#4D96FF', damage: 50, speed: 9 },
        'v': { angle: Math.PI * 7/8, color: '#9B59B6', damage: 50, speed: 9 },
        'b': { angle: -Math.PI/8, color: '#FF6B9D', damage: 50, speed: 9 },
        'n': { angle: -Math.PI * 3/8, color: '#95E1D3', damage: 50, speed: 9 },
        'm': { angle: -Math.PI * 5/8, color: '#F38BA8', damage: 50, speed: 9 }
    };

    const dir = directions[key];
    if(!dir) return;

    const dx = Math.cos(dir.angle) * dir.speed;
    const dy = Math.sin(dir.angle) * dir.speed;

    projectiles.push({
        x: player.x,
        y: player.y,
        dx: dx,
        dy: dy,
        color: dir.color,
        damage: dir.damage,
        life: 100,
        key: key.toUpperCase()
    });

    // Create muzzle flash
    for(let i = 0; i < 5; i++) {
        particles.push({
            x: player.x + dx * 5,
            y: player.y + dy * 5,
            dx: dx * 0.5 + (Math.random() - 0.5) * 2,
            dy: dy * 0.5 + (Math.random() - 0.5) * 2,
            life: 15,
            color: dir.color,
            size: 3 + Math.random() * 2
        });
    }
}

function drawBrawl3DPlayer() {
    const time = Date.now() * 0.005;

    // Pulsing shadow
    brawlStarsCtx.fillStyle = `rgba(0, 0, 0, ${0.3 + Math.sin(time) * 0.1})`;
    brawlStarsCtx.beginPath();
    brawlStarsCtx.arc(player.x + 3, player.y + 3, player.size + 2, 0, Math.PI * 2);
    brawlStarsCtx.fill();

    // Main body with animated gradient
    const gradient = brawlStarsCtx.createRadialGradient(
        player.x - 3, player.y - 3, 0,
        player.x, player.y, player.size + 5
    );
    gradient.addColorStop(0, '#00FF88');
    gradient.addColorStop(0.7, '#00CC66');
    gradient.addColorStop(1, '#008844');

    brawlStarsCtx.fillStyle = gradient;
    brawlStarsCtx.beginPath();
    brawlStarsCtx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
    brawlStarsCtx.fill();

    // Rotating energy ring
    brawlStarsCtx.strokeStyle = '#00FFFF';
    brawlStarsCtx.lineWidth = 3;
    brawlStarsCtx.beginPath();
    brawlStarsCtx.arc(player.x, player.y, player.size + 8, time, time + Math.PI);
    brawlStarsCtx.stroke();

    // Health indicator glow
    const healthPercent = player.health / 100;
    brawlStarsCtx.strokeStyle = `rgba(${255 * (1 - healthPercent)}, ${255 * healthPercent}, 0, 0.8)`;
    brawlStarsCtx.lineWidth = 2;
    brawlStarsCtx.beginPath();
    brawlStarsCtx.arc(player.x, player.y, player.size + 4, 0, Math.PI * 2 * healthPercent);
    brawlStarsCtx.stroke();

    // Core highlight
    brawlStarsCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    brawlStarsCtx.beginPath();
    brawlStarsCtx.arc(player.x - 4, player.y - 4, 4, 0, Math.PI * 2);
    brawlStarsCtx.fill();
}

function updateBrawlEnemies() {
    enemies.forEach((enemy, index) => {
        // Enhanced AI movement based on enemy type
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if(distance > 0) {
            let moveSpeed = enemy.speed;

            // Different AI behaviors
            switch(enemy.type) {
                case 'fast':
                    moveSpeed *= 1.5;
                    // Fast enemies zigzag
                    enemy.x += (dx / distance) * moveSpeed + Math.sin(Date.now() * 0.01) * 2;
                    enemy.y += (dy / distance) * moveSpeed + Math.cos(Date.now() * 0.01) * 2;
                    break;
                case 'heavy':
                    moveSpeed *= 0.7;
                    // Heavy enemies move straight but tank more
                    enemy.x += (dx / distance) * moveSpeed;
                    enemy.y += (dy / distance) * moveSpeed;
                    break;
                default:
                    // Basic enemies circle around player
                    enemy.angle += 0.02;
                    enemy.x += (dx / distance) * moveSpeed + Math.cos(enemy.angle) * 1;
                    enemy.y += (dy / distance) * moveSpeed + Math.sin(enemy.angle) * 1;
            }
        }

        // Enemy shooting
        enemy.shootTimer++;
        if(enemy.shootTimer > 60 && distance < 150) {
            shootEnemyProjectile(enemy);
            enemy.shootTimer = 0;
        }

        // Remove dead enemies
        if(enemy.health <= 0) {
            player.score += enemy.maxHealth;
            createMegaExplosion(enemy.x, enemy.y);
            enemies.splice(index, 1);
        }

        // Boundary bounce
        if(enemy.x < 0 || enemy.x > 400) enemy.speed *= -0.5;
        if(enemy.y < 0 || enemy.y > 300) enemy.speed *= -0.5;
    });
}

function drawBrawl3DEnemies() {
    enemies.forEach(enemy => {
        const time = Date.now() * 0.01;

        // Enhanced shadow with type-specific effects
        brawlStarsCtx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        brawlStarsCtx.beginPath();
        brawlStarsCtx.arc(enemy.x + 4, enemy.y + 4, enemy.size + 2, 0, Math.PI * 2);
        brawlStarsCtx.fill();

        // Type-specific colors and effects
        let colors = ['#FF6B6B', '#FF8E8E']; // Basic
        if(enemy.type === 'heavy') colors = ['#8B4513', '#A0522D'];
        if(enemy.type === 'fast') colors = ['#00CED1', '#40E0D0'];

        const gradient = brawlStarsCtx.createRadialGradient(
            enemy.x - 2, enemy.y - 2, 0,
            enemy.x, enemy.y, enemy.size + 3
        );
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);

        brawlStarsCtx.fillStyle = gradient;
        brawlStarsCtx.beginPath();
        brawlStarsCtx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
        brawlStarsCtx.fill();

        // Animated outline
        brawlStarsCtx.strokeStyle = colors[0];
        brawlStarsCtx.lineWidth = 2;
        brawlStarsCtx.beginPath();
        brawlStarsCtx.arc(enemy.x, enemy.y, enemy.size + Math.sin(time) * 3, 0, Math.PI * 2);
        brawlStarsCtx.stroke();

        // Enhanced health bar
        const healthPercent = enemy.health / enemy.maxHealth;
        brawlStarsCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        brawlStarsCtx.fillRect(enemy.x - 18, enemy.y - 25, 36, 6);
        brawlStarsCtx.fillStyle = `rgba(${255 * (1 - healthPercent)}, ${255 * healthPercent}, 0, 0.9)`;
        brawlStarsCtx.fillRect(enemy.x - 16, enemy.y - 23, 32 * healthPercent, 2);

        // Type indicator
        brawlStarsCtx.fillStyle = colors[0];
        brawlStarsCtx.font = '10px Arial';
        brawlStarsCtx.textAlign = 'center';
        brawlStarsCtx.fillText(enemy.type.charAt(0).toUpperCase(), enemy.x, enemy.y + 3);
    });
}

function updateBrawlProjectiles() {
    projectiles.forEach((proj, index) => {
        proj.x += proj.dx;
        proj.y += proj.dy;
        proj.life--;

        // Check enemy collisions
        enemies.forEach((enemy, enemyIndex) => {
            const dx = proj.x - enemy.x;
            const dy = proj.y - enemy.y;
            if(Math.sqrt(dx * dx + dy * dy) < enemy.size) {
                enemy.health -= proj.damage;
                createHitEffect(proj.x, proj.y, proj.color);
                projectiles.splice(index, 1);
            }
        });

        // Remove projectiles that are off-screen or expired
        if(proj.x < 0 || proj.x > 400 || proj.y < 0 || proj.y > 300 || proj.life <= 0) {
            projectiles.splice(index, 1);
        }
    });
}

function drawBrawlProjectiles() {
    projectiles.forEach(proj => {
        // Draw projectile with trail effect
        brawlStarsCtx.save();
        brawlStarsCtx.globalAlpha = proj.life / 100;

        // Trail
        brawlStarsCtx.strokeStyle = proj.color;
        brawlStarsCtx.lineWidth = 4;
        brawlStarsCtx.beginPath();
        brawlStarsCtx.moveTo(proj.x - proj.dx * 3, proj.y - proj.dy * 3);
        brawlStarsCtx.lineTo(proj.x, proj.y);
        brawlStarsCtx.stroke();

        // Main projectile
        brawlStarsCtx.fillStyle = proj.color;
        brawlStarsCtx.beginPath();
        brawlStarsCtx.arc(proj.x, proj.y, 4, 0, Math.PI * 2);
        brawlStarsCtx.fill();

        // Glow effect
        brawlStarsCtx.shadowColor = proj.color;
        brawlStarsCtx.shadowBlur = 10;
        brawlStarsCtx.fill();
        brawlStarsCtx.shadowBlur = 0;

        // Letter indicator
        brawlStarsCtx.fillStyle = '#FFF';
        brawlStarsCtx.font = 'bold 8px Arial';
        brawlStarsCtx.textAlign = 'center';
        brawlStarsCtx.fillText(proj.key, proj.x, proj.y + 2);

        brawlStarsCtx.restore();
    });
}

function shootEnemyProjectile(enemy) {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    projectiles.push({
        x: enemy.x,
        y: enemy.y,
        dx: (dx / distance) * 3,
        dy: (dy / distance) * 3,
        color: '#FF0000',
        damage: 15,
        life: 80,
        key: '!',
        isEnemyProjectile: true
    });
}

function updatePowerUps() {
    powerUps.forEach((powerUp, index) => {
        // Check player collision
        const dx = player.x - powerUp.x;
        const dy = player.y - powerUp.y;
        if(Math.sqrt(dx * dx + dy * dy) < 20) {
            // Apply power-up effect
            switch(powerUp.type) {
                case 'health':
                    player.health = Math.min(100, player.health + 25);
                    break;
                case 'score':
                    player.score += 100;
                    break;
                case 'life':
                    player.lives++;
                    break;
            }
            createHitEffect(powerUp.x, powerUp.y, powerUp.color);
            powerUps.splice(index, 1);
        }

        powerUp.rotation += 0.1;
    });
}

function drawPowerUps() {
    powerUps.forEach(powerUp => {
        brawlStarsCtx.save();
        brawlStarsCtx.translate(powerUp.x, powerUp.y);
        brawlStarsCtx.rotate(powerUp.rotation);

        // Glow effect
        brawlStarsCtx.shadowColor = powerUp.color;
        brawlStarsCtx.shadowBlur = 15;

        brawlStarsCtx.fillStyle = powerUp.color;
        brawlStarsCtx.fillRect(-8, -8, 16, 16);

        brawlStarsCtx.fillStyle = '#FFF';
        brawlStarsCtx.font = 'bold 12px Arial';
        brawlStarsCtx.textAlign = 'center';
        brawlStarsCtx.fillText(powerUp.symbol, 0, 4);

        brawlStarsCtx.restore();
    });
}

function spawnEnemies() {
    if(enemies.length < 3 && Math.random() < 0.01) {
        const edge = Math.floor(Math.random() * 4);
        let x, y;

        switch(edge) {
            case 0: x = 0; y = Math.random() * 300; break;
            case 1: x = 400; y = Math.random() * 300; break;
            case 2: x = Math.random() * 400; y = 0; break;
            case 3: x = Math.random() * 400; y = 300; break;
        }

        enemies.push({
            x: x, y: y,
            size: 15 + Math.random() * 8,
            health: 100 + Math.random() * 50,
            maxHealth: 100 + Math.random() * 50,
            speed: 0.8 + Math.random() * 1.2,
            angle: Math.random() * Math.PI * 2,
            shootTimer: 0,
            type: ['basic', 'heavy', 'fast'][Math.floor(Math.random() * 3)]
        });
    }
}

function spawnPowerUps() {
    if(powerUps.length < 2 && Math.random() < 0.005) {
        const types = [
            { type: 'health', color: '#00FF00', symbol: '+' },
            { type: 'score', color: '#FFD700', symbol: '$' },
            { type: 'life', color: '#FF69B4', symbol: '♥' }
        ];
        const powerUp = types[Math.floor(Math.random() * types.length)];

        powerUps.push({
            x: Math.random() * 350 + 25,
            y: Math.random() * 250 + 25,
            rotation: 0,
            ...powerUp
        });
    }
}

function createMegaExplosion(x, y) {
    for(let i = 0; i < 25; i++) {
        particles.push({
            x: x, y: y,
            dx: (Math.random() - 0.5) * 12,
            dy: (Math.random() - 0.5) * 12,
            life: 40,
            color: `hsl(${Math.random() * 60}, 100%, 50%)`,
            size: 3 + Math.random() * 4
        });
    }
}

function createHitEffect(x, y, color = '#FFD700') {
    for(let i = 0; i < 12; i++) {
        particles.push({
            x: x, y: y,
            dx: (Math.random() - 0.5) * 6,
            dy: (Math.random() - 0.5) * 6,
            life: 20,
            color: color,
            size: 2 + Math.random() * 2
        });
    }
}

function updateParticles() {
    particles.forEach((particle, index) => {
        particle.x += particle.dx;
        particle.y += particle.dy;
        particle.dx *= 0.98; // Friction
        particle.dy *= 0.98;
        particle.life--;

        brawlStarsCtx.save();
        brawlStarsCtx.fillStyle = particle.color;
        brawlStarsCtx.globalAlpha = particle.life / 40;

        const size = particle.size || 2;
        brawlStarsCtx.beginPath();
        brawlStarsCtx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
        brawlStarsCtx.fill();

        brawlStarsCtx.restore();

        if(particle.life <= 0) particles.splice(index, 1);
    });
}

function drawBrawlUI() {
    // Enhanced UI background
    brawlStarsCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    brawlStarsCtx.fillRect(0, 0, 400, 50);

    // Health bar with glow
    const healthPercent = player.health / 100;
    brawlStarsCtx.fillStyle = 'rgba(100, 0, 0, 0.8)';
    brawlStarsCtx.fillRect(10, 10, 150, 12);

    brawlStarsCtx.fillStyle = `rgba(${255 * (1 - healthPercent)}, ${255 * healthPercent}, 0, 0.9)`;
    brawlStarsCtx.fillRect(10, 10, 150 * healthPercent, 12);

    // Stats display
    brawlStarsCtx.fillStyle = '#00FFFF';
    brawlStarsCtx.font = 'bold 14px Arial';
    brawlStarsCtx.fillText(`Health: ${player.health}`, 10, 35);
    brawlStarsCtx.fillText(`Score: ${player.score}`, 170, 20);
    brawlStarsCtx.fillText(`Lives: ${player.lives}`, 170, 35);
    brawlStarsCtx.fillText(`Enemies: ${enemies.length}`, 280, 20);

    // Controls instruction
    brawlStarsCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    brawlStarsCtx.font = '11px Arial';
    brawlStarsCtx.fillText('WASD: Move | Letters: Shoot in directions', 10, 280);
    brawlStarsCtx.fillText('Q W E R T Y U I O P  -  Different angles & damage', 10, 295);
}

function gameOver() {
    brawlStarsRunning = false;

    const canvas = document.getElementById('brawlStarsGame');
    const ctx = canvas.getContext('2d');

    // Game over screen
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 300);

    ctx.fillStyle = '#FF6B6B';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', 200, 120);

    ctx.fillStyle = '#FFD700';
    ctx.font = '18px Arial';
    ctx.fillText(`Final Score: ${player.score}`, 200, 160);

    ctx.fillStyle = '#4ECDC4';
    ctx.font = '14px Arial';
    ctx.fillText('Click Reset to play again!', 200, 200);
}

function resetBrawlStars() {
    brawlStarsRunning = false;
    player = { x: 200, y: 150, size: 18, health: 100, score: 0, lives: 3 };
    enemies = []; projectiles = []; particles = []; powerUps = [];
    keys = {};

    // Remove event listeners
    document.removeEventListener('keydown', handleBrawlKeyDown);
    document.removeEventListener('keyup', handleBrawlKeyUp);

    const canvas = document.getElementById('brawlStarsGame');
    const ctx = canvas.getContext('2d');

    // Animated start screen
    const gradient = ctx.createRadialGradient(200, 150, 0, 200, 150, 250);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 300);

    ctx.fillStyle = '#00FF88';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('LETTER SHOOTING BRAWL STARS!', 200, 100);

    ctx.fillStyle = '#4ECDC4';
    ctx.font = '16px Arial';
    ctx.fillText('WASD: Move', 200, 140);
    ctx.fillText('Letters Q-M: Shoot in different directions!', 200, 160);
    ctx.fillText('Each letter has unique damage & speed!', 200, 180);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('Click Start Game!', 200, 220);
}

// ENHANCED 3D RACING GAME
let racingCtx, racingRunning = false;
let car = { x: 200, y: 200, speed: 0, angle: 0, drift: 0, lap: 0, position: 0 };
let track = [];
let trackOffset = 0;
let obstacles = [];
let racingParticles = [];

function startRacing() {
    const canvas = document.getElementById('racingGame');
    racingCtx = canvas.getContext('2d');
    racingRunning = true;
    car = { x: 200, y: 200, speed: 0, angle: 0, drift: 0, lap: 0, position: 0 };
    track = [];
    obstacles = [];
    racingParticles = [];
    trackOffset = 0;

    // Generate dynamic track
    for(let i = 0; i < 1000; i++) {
        track.push({
            leftEdge: 50 + Math.sin(i * 0.05) * 80 + Math.cos(i * 0.02) * 40,
            rightEdge: 350 + Math.sin(i * 0.05) * 80 + Math.cos(i * 0.02) * 40,
            elevation: Math.sin(i * 0.1) * 20
        });
    }

    // Add obstacles
    for(let i = 0; i < 20; i++) {
        obstacles.push({
            x: Math.random() * 200 + 100,
            z: Math.random() * 800 + 100,
            type: Math.random() > 0.5 ? 'cone' : 'barrier'
        });
    }

    racingGameLoop();
    document.addEventListener('keydown', controlRacingCar);
}

function racingGameLoop() {
    if(!racingRunning) return;

    // Dynamic sky gradient
    const skyGradient = racingCtx.createLinearGradient(0, 0, 0, 150);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(1, '#4682B4');
    racingCtx.fillStyle = skyGradient;
    racingCtx.fillRect(0, 0, 400, 150);

    // Ground
    const groundGradient = racingCtx.createLinearGradient(0, 150, 0, 300);
    groundGradient.addColorStop(0, '#228B22');
    groundGradient.addColorStop(1, '#006400');
    racingCtx.fillStyle = groundGradient;
    racingCtx.fillRect(0, 150, 400, 150);

    // 3D Track rendering with perspective
    const horizon = 150;
    for(let i = 0; i < 80; i++) {
        const z = i + trackOffset;
        const trackIndex = Math.floor(z) % track.length;
        const trackSegment = track[trackIndex];

        const scale = 200 / (200 + i * 3);
        const y = horizon + i * 2 + trackSegment.elevation * scale;

        const leftX = 200 + (trackSegment.leftEdge - 200) * scale;
        const rightX = 200 + (trackSegment.rightEdge - 200) * scale;
        const width = rightX - leftX;

        // Track surface
        racingCtx.fillStyle = i % 10 < 5 ? '#444' : '#333';
        racingCtx.fillRect(leftX, y, width, 3 * scale);

        // Track edges
        racingCtx.fillStyle = '#FFD700';
        racingCtx.fillRect(leftX - 2, y, 4, 3 * scale);
        racingCtx.fillRect(rightX - 2, y, 4, 3 * scale);

        // Center line
        if(Math.floor(z / 10) % 2 === 0) {
            racingCtx.fillStyle = '#FFF';
            racingCtx.fillRect(200 - 2, y, 4, 2 * scale);
        }
    }

    // Draw obstacles with 3D perspective
    obstacles.forEach(obstacle => {
        const relativeZ = obstacle.z - trackOffset;
        if(relativeZ > 0 && relativeZ < 100) {
            const scale = 200 / (200 + relativeZ * 3);
            const screenX = 200 + (obstacle.x - 200) * scale;
            const screenY = horizon + relativeZ * 2;

            racingCtx.fillStyle = obstacle.type === 'cone' ? '#FF8C00' : '#8B4513';
            if(obstacle.type === 'cone') {
                racingCtx.beginPath();
                racingCtx.moveTo(screenX, screenY);
                racingCtx.lineTo(screenX - 10 * scale, screenY + 20 * scale);
                racingCtx.lineTo(screenX + 10 * scale, screenY + 20 * scale);
                racingCtx.closePath();
                racingCtx.fill();
            } else {
                racingCtx.fillRect(screenX - 15 * scale, screenY, 30 * scale, 15 * scale);
            }
        }
    });

    // Enhanced car rendering
    racingCtx.save();
    racingCtx.translate(car.x, car.y);
    racingCtx.rotate(car.angle + car.drift * 0.1);

    // Car shadow
    racingCtx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    racingCtx.fillRect(-12, -20, 24, 40);

    // Car body with metallic gradient
    const carGradient = racingCtx.createLinearGradient(0, -20, 0, 20);
    carGradient.addColorStop(0, '#FF4444');
    carGradient.addColorStop(0.3, '#FF6666');
    carGradient.addColorStop(0.7, '#CC2222');
    carGradient.addColorStop(1, '#AA1111');
    racingCtx.fillStyle = carGradient;
    racingCtx.fillRect(-10, -18, 20, 36);

    // Car windows
    racingCtx.fillStyle = '#4169E1';
    racingCtx.fillRect(-8, -12, 16, 8);
    racingCtx.fillRect(-8, 4, 16, 8);

    // Car details
    racingCtx.fillStyle = '#FFD700';
    racingCtx.fillRect(-10, 15, 20, 3); // Front bumper
    racingCtx.fillStyle = '#FF0000';
    racingCtx.fillRect(-10, -18, 20, 2); // Rear lights

    racingCtx.restore();

    // Engine particles when accelerating
    if(car.speed > 2) {
        for(let i = 0; i < 3; i++) {
            racingParticles.push({
                x: car.x + (Math.random() - 0.5) * 10,
                y: car.y + 20 + Math.random() * 5,
                life: 20,
                dx: (Math.random() - 0.5) * 2,
                dy: Math.random() * 2 + 1
            });
        }
    }

    // Update and draw particles
    racingParticles.forEach((particle, index) => {
        particle.x += particle.dx;
        particle.y += particle.dy;
        particle.life--;

        racingCtx.save();
        racingCtx.globalAlpha = particle.life / 20;
        racingCtx.fillStyle = '#666';
        racingCtx.beginPath();
        racingCtx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        racingCtx.fill();
        racingCtx.restore();

        if(particle.life <= 0) racingParticles.splice(index, 1);
    });

    // Car physics
    car.speed *= 0.95; // Natural deceleration
    car.drift *= 0.9; // Drift reduction
    car.angle += car.drift * 0.02;

    // Track following
    trackOffset += car.speed * 0.5;
    car.position = trackOffset;

    // Track boundaries
    const currentTrack = track[Math.floor(trackOffset) % track.length];
    if(car.x < currentTrack.leftEdge + 20) {
        car.x = currentTrack.leftEdge + 20;
        car.speed *= 0.5;
    }
    if(car.x > currentTrack.rightEdge - 20) {
        car.x = currentTrack.rightEdge - 20;
        car.speed *= 0.5;
    }

    // Enhanced UI
    racingCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    racingCtx.fillRect(0, 0, 400, 40);

    racingCtx.fillStyle = '#00FFFF';
    racingCtx.font = 'bold 14px Arial';
    racingCtx.fillText(`Speed: ${Math.floor(car.speed * 50)} mph`, 10, 20);
    racingCtx.fillText(`Position: ${Math.floor(car.position)}m`, 160, 20);
    racingCtx.fillText(`Drift: ${Math.abs(car.drift).toFixed(1)}`, 280, 20);

    // Speed bar
    racingCtx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    racingCtx.fillRect(10, 25, 100, 8);
    racingCtx.fillStyle = '#00FF00';
    racingCtx.fillRect(10, 25, (car.speed / 8) * 100, 8);

    requestAnimationFrame(racingGameLoop);
}

function controlRacingCar(e) {
    if(!racingRunning) return;

    switch(e.key) {
        case 'ArrowUp':
            car.speed = Math.min(8, car.speed + 0.3);
            break;
        case 'ArrowDown':
            car.speed = Math.max(-2, car.speed - 0.4);
            break;
        case 'ArrowLeft':
            car.drift -= 0.2;
            car.x = Math.max(50, car.x - car.speed * 0.8);
            break;
        case 'ArrowRight':
            car.drift += 0.2;
            car.x = Math.min(350, car.x + car.speed * 0.8);
            break;
        case ' ':
            car.speed *= 0.7; // Brake
            break;
    }
}

function resetRacing() {
    racingRunning = false;
    const canvas = document.getElementById('racingGame');
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, '#001122');
    gradient.addColorStop(1, '#003366');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 300);

    ctx.fillStyle = '#FF6B6B';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏎️ TURBO RACING 3D', 200, 120);

    ctx.fillStyle = '#4ECDC4';
    ctx.font = '14px Arial';
    ctx.fillText('↑↓: Accelerate/Brake', 200, 150);
    ctx.fillText('←→: Steer & Drift', 200, 170);
    ctx.fillText('Space: Handbrake', 200, 190);

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Ready to Race?', 200, 230);
}

// SPACE GAME
let spaceCtx, spaceRunning = false;
let spaceship = { x: 200, y: 250, dx: 0, dy: 0 };
let stars = [];

function startSpace() {
    const canvas = document.getElementById('spaceGame');
    spaceCtx = canvas.getContext('2d');
    spaceRunning = true;
    spaceship = { x: 200, y: 250, dx: 0, dy: 0 };

    stars = [];
    for(let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * 400,
            y: Math.random() * 300,
            size: Math.random() * 2,
            speed: Math.random() * 2 + 1
        });
    }

    spaceGameLoop();
    document.addEventListener('keydown', controlSpaceship);
}

function spaceGameLoop() {
    if(!spaceRunning) return;

    spaceCtx.fillStyle = '#000011';
    spaceCtx.fillRect(0, 0, 400, 300);

    // Moving stars
    stars.forEach(star => {
        star.y += star.speed;
        if(star.y > 300) star.y = 0;

        spaceCtx.fillStyle = `rgba(255, 255, 255, ${star.size / 2})`;
        spaceCtx.beginPath();
        spaceCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        spaceCtx.fill();
    });

    // Draw spaceship
    spaceCtx.save();
    spaceCtx.translate(spaceship.x, spaceship.y);

    const shipGradient = spaceCtx.createLinearGradient(0, -15, 0, 15);
    shipGradient.addColorStop(0, '#4FC3F7');
    shipGradient.addColorStop(1, '#0277BD');
    spaceCtx.fillStyle = shipGradient;
    spaceCtx.beginPath();
    spaceCtx.moveTo(0, -15);
    spaceCtx.lineTo(-8, 15);
    spaceCtx.lineTo(8, 15);
    spaceCtx.closePath();
    spaceCtx.fill();

    spaceCtx.restore();

    spaceship.x += spaceship.dx;
    spaceship.y += spaceship.dy;
    spaceship.dx *= 0.98;
    spaceship.dy *= 0.98;

    if(spaceship.x < 0) spaceship.x = 400;
    if(spaceship.x > 400) spaceship.x = 0;
    if(spaceship.y < 0) spaceship.y = 300;
    if(spaceship.y > 300) spaceship.y = 0;

    requestAnimationFrame(spaceGameLoop);
}

function controlSpaceship(e) {
    if(!spaceRunning) return;
    const thrust = 0.5;
    switch(e.key) {
        case 'ArrowUp': spaceship.dy -= thrust; break;
        case 'ArrowDown': spaceship.dy += thrust; break;
        case 'ArrowLeft': spaceship.dx -= thrust; break;
        case 'ArrowRight': spaceship.dx += thrust; break;
    }
}

function resetSpace() {
    spaceRunning = false;
    const canvas = document.getElementById('spaceGame');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 400, 300);
    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, 400, 300);
    ctx.fillStyle = '#4FC3F7';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Galaxy Explorer 3D!', 200, 140);
    ctx.fillText('Arrow Keys to Fly', 200, 170);
}

// ADVENTURE GAME
let adventureCtx, adventureRunning = false;
let hero = { x: 50, y: 200, health: 100 };
let monsters = [];

function startAdventure() {
    const canvas = document.getElementById('adventureGame');
    adventureCtx = canvas.getContext('2d');
    adventureRunning = true;
    hero = { x: 50, y: 200, health: 100 };

    monsters = [];
    for(let i = 0; i < 4; i++) {
        monsters.push({
            x: 300 + i * 50,
            y: 180 + Math.random() * 40,
            health: 30,
            type: ['orc', 'goblin'][Math.floor(Math.random() * 2)]
        });
    }

    adventureGameLoop();
    document.addEventListener('keydown', controlHero);
}

function adventureGameLoop() {
    if(!adventureRunning) return;

    const bgGradient = adventureCtx.createLinearGradient(0, 0, 0, 300);
    bgGradient.addColorStop(0, '#4A148C');
    bgGradient.addColorStop(1, '#1A237E');
    adventureCtx.fillStyle = bgGradient;
    adventureCtx.fillRect(0, 0, 400, 300);

    // Draw monsters
    monsters.forEach(monster => {
        const color = monster.type === 'orc' ? '#8BC34A' : '#FF9800';

        const gradient = adventureCtx.createRadialGradient(monster.x, monster.y, 0, monster.x, monster.y, 15);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, '#333');
        adventureCtx.fillStyle = gradient;
        adventureCtx.beginPath();
        adventureCtx.arc(monster.x, monster.y, 15, 0, Math.PI * 2);
        adventureCtx.fill();
    });

    // Draw hero
    const heroGradient = adventureCtx.createRadialGradient(hero.x, hero.y, 0, hero.x, hero.y, 12);
    heroGradient.addColorStop(0, '#2196F3');
    heroGradient.addColorStop(1, '#0D47A1');
    adventureCtx.fillStyle = heroGradient;
    adventureCtx.beginPath();
    adventureCtx.arc(hero.x, hero.y, 12, 0, Math.PI * 2);
    adventureCtx.fill();

    adventureCtx.fillStyle = '#FFD700';
    adventureCtx.font = '14px Arial';
    adventureCtx.fillText(`Health: ${hero.health}`, 10, 25);
    adventureCtx.fillText(`Monsters: ${monsters.length}`, 10, 45);

    requestAnimationFrame(adventureGameLoop);
}

function controlHero(e) {
    if(!adventureRunning) return;
    const speed = 5;
    switch(e.key) {
        case 'ArrowUp': if(hero.y > 15) hero.y -= speed; break;
        case 'ArrowDown': if(hero.y < 285) hero.y += speed; break;
        case 'ArrowLeft': if(hero.x > 15) hero.x -= speed; break;
        case 'ArrowRight': if(hero.x < 385) hero.x += speed; break;
        case ' ':
            monsters = monsters.filter(monster => {
                const dx = hero.x - monster.x;
                const dy = hero.y - monster.y;
                return Math.sqrt(dx * dx + dy * dy) > 30;
            });
            break;
    }
}

function resetAdventure() {
    adventureRunning = false;
    const canvas = document.getElementById('adventureGame');
    const ctx = canvas.getContext('2d');

    const bgGradient = ctx.createLinearGradient(0, 0, 0, 300);
    bgGradient.addColorStop(0, '#4A148C');
    bgGradient.addColorStop(1, '#1A237E');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 400, 300);

    ctx.fillStyle = '#FFD700';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Epic Quest 3D!', 200, 140);
    ctx.fillText('Arrows: Move | Space: Attack', 200, 170);
}

// Initialize games on load
setTimeout(() => {
    resetBrawlStars();
    resetRacing();
    resetSpace();
    resetAdventure();
}, 1000);