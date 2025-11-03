// ========== 10 EPIC FULLSCREEN GAMES ==========

// Fullscreen functionality
function toggleFullscreen(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!document.fullscreenElement) {
        canvas.requestFullscreen().then(() => {
            canvas.width = Math.min(800, window.screen.width * 0.9);
            canvas.height = Math.min(800, window.screen.height * 0.9);
            canvas.width = Math.floor(canvas.width / gridSize) * gridSize;
            canvas.height = Math.floor(canvas.height / gridSize) * gridSize;
            canvas.style.width = '100vw';
            canvas.style.height = '100vh';
            canvas.style.objectFit = 'contain';

            // Respawn food within new canvas bounds if needed
            if (canvasId === 'snakeGame' && snakeRunning) {
                spawnSnakeFood();
            }
        }).catch(err => {
            console.log('Fullscreen failed:', err);
        });
    } else {
        document.exitFullscreen().then(() => {
            canvas.width = 400;
            canvas.height = 300;
            canvas.style.width = '400px';
            canvas.style.height = '300px';
            canvas.style.objectFit = 'initial';

            // Respawn food within new canvas bounds if needed
            if (canvasId === 'snakeGame' && snakeRunning) {
                spawnSnakeFood();
            }
        });
    }
}

// ========== 1. NEON SNAKE ARENA ==========
let snakeCtx, snakeRunning = false;
let snake = { body: [{x: 10, y: 10}], direction: {x: 0, y: 0}, growing: false };
let snakeFood = { x: 5, y: 5 };
let snakeScore = 0;
let snakeSpeed = 120;
let snakeParticles = [];
let snakeCanvas;
let gridSize = 20;
let gameInterval;

function startSnake() {
    snakeCanvas = document.getElementById('snakeGame');
    snakeCtx = snakeCanvas.getContext('2d');
    snakeRunning = true;

    // Reset game state
    snake = { body: [{x: 10, y: 10}], direction: {x: 0, y: 0}, growing: false };
    snakeScore = 0;
    snakeParticles = [];
    spawnSnakeFood();

    // Clear any existing interval
    if (gameInterval) clearInterval(gameInterval);

    document.addEventListener('keydown', handleSnakeKeys);
    gameInterval = setInterval(snakeGameLoop, snakeSpeed);
}

function snakeGameLoop() {
    if (!snakeRunning) return;

    const canvasWidth = snakeCanvas.width;
    const canvasHeight = snakeCanvas.height;
    const tileCountX = Math.floor(canvasWidth / gridSize);
    const tileCountY = Math.floor(canvasHeight / gridSize);

    // Neon background
    const gradient = snakeCtx.createRadialGradient(canvasWidth/2, canvasHeight/2, 0, canvasWidth/2, canvasHeight/2, Math.max(canvasWidth, canvasHeight)/2);
    gradient.addColorStop(0, '#001122');
    gradient.addColorStop(1, '#000011');
    snakeCtx.fillStyle = gradient;
    snakeCtx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Grid effect
    snakeCtx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    snakeCtx.lineWidth = 1;
    for(let i = 0; i < canvasWidth; i += gridSize) {
        snakeCtx.beginPath();
        snakeCtx.moveTo(i, 0);
        snakeCtx.lineTo(i, canvasHeight);
        snakeCtx.stroke();
    }
    for(let i = 0; i < canvasHeight; i += gridSize) {
        snakeCtx.beginPath();
        snakeCtx.moveTo(0, i);
        snakeCtx.lineTo(canvasWidth, i);
        snakeCtx.stroke();
    }

    // Move snake only if direction is set
    if (snake.direction.x !== 0 || snake.direction.y !== 0) {
        const head = {x: snake.body[0].x + snake.direction.x, y: snake.body[0].y + snake.direction.y};

        // Wall collision
        if(head.x < 0 || head.x >= tileCountX || head.y < 0 || head.y >= tileCountY) {
            snakeRunning = false;
            snakeGameOver();
            return;
        }

        // Self collision
        for(let segment of snake.body) {
            if(head.x === segment.x && head.y === segment.y) {
                snakeRunning = false;
                snakeGameOver();
                return;
            }
        }

        snake.body.unshift(head);

        // Food collision
        if(head.x === snakeFood.x && head.y === snakeFood.y) {
            snakeScore += 10;
            spawnSnakeFood();

            // Explosion effect
            for(let i = 0; i < 15; i++) {
            snakeParticles.push({
                x: head.x + 10,
                y: head.y + 10,
                dx: (Math.random() - 0.5) * 8,
                dy: (Math.random() - 0.5) * 8,
                life: 30,
                color: `hsl(${Math.random() * 360}, 100%, 50%)`
            });
        }
    } else {
        snake.body.pop();
    }

    // Draw snake with neon effect
    snake.body.forEach((segment, index) => {
        const intensity = 1 - (index / snake.body.length) * 0.5;

        snakeCtx.shadowColor = '#00FF00';
        snakeCtx.shadowBlur = 15;
        snakeCtx.fillStyle = `rgba(0, 255, 0, ${intensity})`;
        snakeCtx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);

        snakeCtx.shadowBlur = 0;
        snakeCtx.fillStyle = index === 0 ? '#FFFF00' : '#00AA00';
        snakeCtx.fillRect(segment.x * gridSize + 2, segment.y * gridSize + 2, gridSize - 6, gridSize - 6);
    });

    // Draw food with glow
    snakeCtx.shadowColor = '#FF0000';
    snakeCtx.shadowBlur = 20;
    snakeCtx.fillStyle = '#FF0000';
    snakeCtx.fillRect(snakeFood.x * gridSize, snakeFood.y * gridSize, gridSize - 2, gridSize - 2);

    snakeCtx.shadowBlur = 0;
    snakeCtx.fillStyle = '#FFFF00';
    snakeCtx.fillRect(snakeFood.x * gridSize + 4, snakeFood.y * gridSize + 4, gridSize - 10, gridSize - 10);

    // Update particles
    snakeParticles.forEach((particle, index) => {
        particle.x += particle.dx;
        particle.y += particle.dy;
        particle.life--;

        snakeCtx.save();
        snakeCtx.globalAlpha = particle.life / 30;
        snakeCtx.fillStyle = particle.color;
        snakeCtx.beginPath();
        snakeCtx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
        snakeCtx.fill();
        snakeCtx.restore();

        if(particle.life <= 0) snakeParticles.splice(index, 1);
    });

    // UI
    snakeCtx.fillStyle = '#00FFFF';
    snakeCtx.font = 'bold 20px Arial';
    snakeCtx.fillText(`Score: ${snakeScore}`, 10, 30);
    snakeCtx.fillText(`Length: ${snake.body.length}`, 10, 55);

    // Game loop continues via setInterval
}

function handleSnakeKeys(e) {
    if(!snakeRunning) return;

    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if(snake.direction.y === 0) snake.direction = {x: 0, y: -1};
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if(snake.direction.y === 0) snake.direction = {x: 0, y: 1};
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if(snake.direction.x === 0) snake.direction = {x: -1, y: 0};
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if(snake.direction.x === 0) snake.direction = {x: 1, y: 0};
            break;
    }
}

function spawnSnakeFood() {
    const tileCountX = Math.floor(snakeCanvas.width / gridSize);
    const tileCountY = Math.floor(snakeCanvas.height / gridSize);

    do {
        snakeFood.x = Math.floor(Math.random() * tileCountX);
        snakeFood.y = Math.floor(Math.random() * tileCountY);
    } while (snake.body.some(segment => segment.x === snakeFood.x && segment.y === snakeFood.y));
}

function snakeGameOver() {
    clearInterval(gameInterval);

    snakeCtx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);

    snakeCtx.fillStyle = '#FF0000';
    snakeCtx.font = 'bold 30px Arial';
    snakeCtx.textAlign = 'center';
    snakeCtx.fillText('GAME OVER', snakeCanvas.width/2, snakeCanvas.height/2 - 40);

    snakeCtx.fillStyle = '#FFFF00';
    snakeCtx.font = '20px Arial';
    snakeCtx.fillText(`Final Score: ${snakeScore}`, snakeCanvas.width/2, snakeCanvas.height/2);

    snakeCtx.fillStyle = '#00FFFF';
    snakeCtx.font = '16px Arial';
    snakeCtx.fillText('Click Start Snake to play again!', snakeCanvas.width/2, snakeCanvas.height/2 + 40);
}

// ========== 2. ZOMBIE APOCALYPSE ==========
let zombieCtx, zombieRunning = false;
let zombiePlayer = { x: 200, y: 150, health: 100, ammo: 30, score: 0 };
let zombies = [];
let zombieBullets = [];
let zombieWave = 1;

function startZombie() {
    const canvas = document.getElementById('zombieGame');
    zombieCtx = canvas.getContext('2d');
    zombieRunning = true;

    zombiePlayer = { x: 200, y: 150, health: 100, ammo: 30, score: 0 };
    zombies = [];
    zombieBullets = [];
    zombieWave = 1;

    spawnZombieWave();
    document.addEventListener('keydown', handleZombieKeys);
    document.addEventListener('click', shootZombie);
    zombieGameLoop();
}

function zombieGameLoop() {
    if (!zombieRunning) return;

    // Dark apocalyptic background
    const gradient = zombieCtx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, '#2C1810');
    gradient.addColorStop(1, '#1A0F08');
    zombieCtx.fillStyle = gradient;
    zombieCtx.fillRect(0, 0, 400, 300);

    // Update zombies
    zombies.forEach((zombie, index) => {
        const dx = zombiePlayer.x - zombie.x;
        const dy = zombiePlayer.y - zombie.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if(distance > 0) {
            zombie.x += (dx / distance) * zombie.speed;
            zombie.y += (dy / distance) * zombie.speed;
        }

        // Zombie attack
        if(distance < 20) {
            zombiePlayer.health -= 2;
            if(zombiePlayer.health <= 0) {
                zombieRunning = false;
                zombieGameOver();
                return;
            }
        }

        // Draw zombie
        zombieCtx.fillStyle = zombie.color;
        zombieCtx.beginPath();
        zombieCtx.arc(zombie.x, zombie.y, 12, 0, Math.PI * 2);
        zombieCtx.fill();

        zombieCtx.fillStyle = '#FF0000';
        zombieCtx.beginPath();
        zombieCtx.arc(zombie.x - 4, zombie.y - 4, 2, 0, Math.PI * 2);
        zombieCtx.arc(zombie.x + 4, zombie.y - 4, 2, 0, Math.PI * 2);
        zombieCtx.fill();
    });

    // Update bullets
    zombieBullets.forEach((bullet, index) => {
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;

        zombieCtx.fillStyle = '#FFFF00';
        zombieCtx.beginPath();
        zombieCtx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
        zombieCtx.fill();

        // Check zombie collisions
        zombies.forEach((zombie, zIndex) => {
            const dx = bullet.x - zombie.x;
            const dy = bullet.y - zombie.y;
            if(Math.sqrt(dx * dx + dy * dy) < 15) {
                zombies.splice(zIndex, 1);
                zombieBullets.splice(index, 1);
                zombiePlayer.score += 10;
            }
        });

        // Remove off-screen bullets
        if(bullet.x < 0 || bullet.x > 400 || bullet.y < 0 || bullet.y > 300) {
            zombieBullets.splice(index, 1);
        }
    });

    // Draw player
    zombieCtx.fillStyle = '#0066FF';
    zombieCtx.beginPath();
    zombieCtx.arc(zombiePlayer.x, zombiePlayer.y, 15, 0, Math.PI * 2);
    zombieCtx.fill();

    // Spawn new wave
    if(zombies.length === 0) {
        zombieWave++;
        spawnZombieWave();
    }

    // UI
    zombieCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    zombieCtx.fillRect(0, 0, 400, 50);

    zombieCtx.fillStyle = '#FF0000';
    zombieCtx.font = 'bold 14px Arial';
    zombieCtx.fillText(`Health: ${zombiePlayer.health}`, 10, 20);
    zombieCtx.fillText(`Ammo: ${zombiePlayer.ammo}`, 10, 35);
    zombieCtx.fillText(`Score: ${zombiePlayer.score}`, 150, 20);
    zombieCtx.fillText(`Wave: ${zombieWave}`, 150, 35);
    zombieCtx.fillText(`Zombies: ${zombies.length}`, 250, 20);

    requestAnimationFrame(zombieGameLoop);
}

function spawnZombieWave() {
    const zombieCount = 5 + zombieWave * 2;
    for(let i = 0; i < zombieCount; i++) {
        const edge = Math.floor(Math.random() * 4);
        let x, y;
        switch(edge) {
            case 0: x = 0; y = Math.random() * 300; break;
            case 1: x = 400; y = Math.random() * 300; break;
            case 2: x = Math.random() * 400; y = 0; break;
            case 3: x = Math.random() * 400; y = 300; break;
        }

        zombies.push({
            x: x,
            y: y,
            speed: 0.5 + Math.random() * 0.5,
            color: `hsl(${Math.random() * 60 + 80}, 50%, 30%)`
        });
    }
}

function handleZombieKeys(e) {
    if(!zombieRunning) return;

    const speed = 4;
    switch(e.key) {
        case 'w': case 'W':
            if(zombiePlayer.y > 15) zombiePlayer.y -= speed;
            break;
        case 's': case 'S':
            if(zombiePlayer.y < 285) zombiePlayer.y += speed;
            break;
        case 'a': case 'A':
            if(zombiePlayer.x > 15) zombiePlayer.x -= speed;
            break;
        case 'd': case 'D':
            if(zombiePlayer.x < 385) zombiePlayer.x += speed;
            break;
        case 'r': case 'R':
            zombiePlayer.ammo = 30;
            break;
    }
}

function shootZombie(e) {
    if(!zombieRunning || zombiePlayer.ammo <= 0) return;

    const rect = e.target.getBoundingClientRect();
    const targetX = e.clientX - rect.left;
    const targetY = e.clientY - rect.top;

    const dx = targetX - zombiePlayer.x;
    const dy = targetY - zombiePlayer.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    zombieBullets.push({
        x: zombiePlayer.x,
        y: zombiePlayer.y,
        dx: (dx / distance) * 8,
        dy: (dy / distance) * 8
    });

    zombiePlayer.ammo--;
}

function zombieGameOver() {
    zombieCtx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    zombieCtx.fillRect(0, 0, 400, 300);

    zombieCtx.fillStyle = '#FF0000';
    zombieCtx.font = 'bold 28px Arial';
    zombieCtx.textAlign = 'center';
    zombieCtx.fillText('YOU DIED', 200, 120);

    zombieCtx.fillStyle = '#FFFF00';
    zombieCtx.font = '18px Arial';
    zombieCtx.fillText(`Waves Survived: ${zombieWave}`, 200, 160);
    zombieCtx.fillText(`Final Score: ${zombiePlayer.score}`, 200, 180);
}

// ========== 3. SHADOW NINJA ==========
let ninjaCtx, ninjaRunning = false;
let ninja = { x: 50, y: 200, dx: 0, dy: 0, onGround: false, canWallJump: true };
let ninjaPlatforms = [];
let ninjaEnemies = [];

function startNinja() {
    const canvas = document.getElementById('ninjaGame');
    ninjaCtx = canvas.getContext('2d');
    ninjaRunning = true;

    ninja = { x: 50, y: 200, dx: 0, dy: 0, onGround: false, canWallJump: true };
    generateNinjaPlatforms();
    generateNinjaEnemies();

    document.addEventListener('keydown', handleNinjaKeys);
    ninjaGameLoop();
}

function ninjaGameLoop() {
    if (!ninjaRunning) return;

    // Night sky background
    const gradient = ninjaCtx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, '#1a0033');
    gradient.addColorStop(1, '#000011');
    ninjaCtx.fillStyle = gradient;
    ninjaCtx.fillRect(0, 0, 400, 300);

    // Physics
    ninja.dy += 0.5; // gravity
    ninja.x += ninja.dx;
    ninja.y += ninja.dy;

    ninja.dx *= 0.9; // friction
    ninja.onGround = false;

    // Platform collisions
    ninjaPlatforms.forEach(platform => {
        if(ninja.x < platform.x + platform.width &&
           ninja.x + 20 > platform.x &&
           ninja.y < platform.y + platform.height &&
           ninja.y + 20 > platform.y) {

            if(ninja.dy > 0 && ninja.y < platform.y) {
                ninja.y = platform.y - 20;
                ninja.dy = 0;
                ninja.onGround = true;
                ninja.canWallJump = true;
            }
        }
    });

    // Boundary checks
    if(ninja.y > 280) {
        ninja.y = 280;
        ninja.dy = 0;
        ninja.onGround = true;
    }

    if(ninja.x < 0) ninja.x = 0;
    if(ninja.x > 380) ninja.x = 380;

    // Draw platforms
    ninjaPlatforms.forEach(platform => {
        ninjaCtx.fillStyle = '#444444';
        ninjaCtx.fillRect(platform.x, platform.y, platform.width, platform.height);

        ninjaCtx.fillStyle = '#666666';
        ninjaCtx.fillRect(platform.x, platform.y, platform.width, 2);
    });

    // Draw ninja with shadow effect
    ninjaCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ninjaCtx.fillRect(ninja.x + 2, ninja.y + 2, 18, 18);

    ninjaCtx.fillStyle = '#2200BB';
    ninjaCtx.fillRect(ninja.x, ninja.y, 18, 18);

    ninjaCtx.fillStyle = '#FFFF00';
    ninjaCtx.fillRect(ninja.x + 6, ninja.y + 4, 2, 2);
    ninjaCtx.fillRect(ninja.x + 12, ninja.y + 4, 2, 2);

    // Trail effect
    if(Math.abs(ninja.dx) > 2 || Math.abs(ninja.dy) > 2) {
        ninjaCtx.fillStyle = 'rgba(34, 0, 187, 0.3)';
        ninjaCtx.fillRect(ninja.x - ninja.dx, ninja.y - ninja.dy, 18, 18);
    }

    // UI
    ninjaCtx.fillStyle = '#FFFF00';
    ninjaCtx.font = 'bold 16px Arial';
    ninjaCtx.fillText('WASD: Move, Space: Jump', 10, 25);

    requestAnimationFrame(ninjaGameLoop);
}

function generateNinjaPlatforms() {
    ninjaPlatforms = [
        {x: 100, y: 250, width: 80, height: 10},
        {x: 220, y: 200, width: 80, height: 10},
        {x: 50, y: 150, width: 60, height: 10},
        {x: 300, y: 120, width: 90, height: 10},
        {x: 150, y: 100, width: 70, height: 10}
    ];
}

function generateNinjaEnemies() {
    ninjaEnemies = [];
}

function handleNinjaKeys(e) {
    if(!ninjaRunning) return;

    switch(e.key) {
        case 'w': case 'W':
            if(ninja.onGround || ninja.canWallJump) {
                ninja.dy = -12;
                ninja.canWallJump = false;
            }
            break;
        case 'a': case 'A':
            ninja.dx -= 1.5;
            break;
        case 'd': case 'D':
            ninja.dx += 1.5;
            break;
        case ' ':
            if(ninja.onGround || ninja.canWallJump) {
                ninja.dy = -15;
                ninja.canWallJump = false;
            }
            break;
    }
}

// ========== 4. GALACTIC WAR ==========
let shooterCtx, shooterRunning = false;
let shooterPlayer = { x: 200, y: 250, health: 100, score: 0 };
let shooterBullets = [];
let shooterEnemies = [];
let shooterStars = [];

function startShooter() {
    const canvas = document.getElementById('shooterGame');
    shooterCtx = canvas.getContext('2d');
    shooterRunning = true;

    shooterPlayer = { x: 200, y: 250, health: 100, score: 0 };
    shooterBullets = [];
    shooterEnemies = [];
    shooterStars = [];

    // Generate stars
    for(let i = 0; i < 100; i++) {
        shooterStars.push({
            x: Math.random() * 400,
            y: Math.random() * 300,
            speed: Math.random() * 2 + 1,
            size: Math.random() * 2
        });
    }

    document.addEventListener('keydown', handleShooterKeys);
    setInterval(spawnShooterEnemy, 2000);
    shooterGameLoop();
}

function shooterGameLoop() {
    if (!shooterRunning) return;

    // Space background
    shooterCtx.fillStyle = '#000011';
    shooterCtx.fillRect(0, 0, 400, 300);

    // Moving stars
    shooterStars.forEach(star => {
        star.y += star.speed;
        if(star.y > 300) star.y = 0;

        shooterCtx.fillStyle = `rgba(255, 255, 255, ${star.size})`;
        shooterCtx.beginPath();
        shooterCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        shooterCtx.fill();
    });

    // Update bullets
    shooterBullets.forEach((bullet, index) => {
        bullet.y -= 8;

        shooterCtx.fillStyle = '#00FFFF';
        shooterCtx.fillRect(bullet.x, bullet.y, 4, 8);

        if(bullet.y < 0) shooterBullets.splice(index, 1);
    });

    // Update enemies
    shooterEnemies.forEach((enemy, index) => {
        enemy.y += enemy.speed;
        enemy.x += Math.sin(enemy.y * 0.01) * 2;

        // Draw enemy ship
        shooterCtx.fillStyle = enemy.color;
        shooterCtx.beginPath();
        shooterCtx.moveTo(enemy.x, enemy.y);
        shooterCtx.lineTo(enemy.x - 10, enemy.y - 15);
        shooterCtx.lineTo(enemy.x + 10, enemy.y - 15);
        shooterCtx.closePath();
        shooterCtx.fill();

        // Check bullet collisions
        shooterBullets.forEach((bullet, bIndex) => {
            if(bullet.x > enemy.x - 15 && bullet.x < enemy.x + 15 &&
               bullet.y > enemy.y - 15 && bullet.y < enemy.y + 15) {
                shooterEnemies.splice(index, 1);
                shooterBullets.splice(bIndex, 1);
                shooterPlayer.score += 100;
            }
        });

        // Check player collision
        if(Math.abs(enemy.x - shooterPlayer.x) < 20 && Math.abs(enemy.y - shooterPlayer.y) < 20) {
            shooterPlayer.health -= 10;
            shooterEnemies.splice(index, 1);
            if(shooterPlayer.health <= 0) {
                shooterRunning = false;
                shooterGameOver();
                return;
            }
        }

        if(enemy.y > 300) shooterEnemies.splice(index, 1);
    });

    // Draw player ship
    shooterCtx.fillStyle = '#00FF00';
    shooterCtx.beginPath();
    shooterCtx.moveTo(shooterPlayer.x, shooterPlayer.y - 15);
    shooterCtx.lineTo(shooterPlayer.x - 10, shooterPlayer.y + 10);
    shooterCtx.lineTo(shooterPlayer.x, shooterPlayer.y + 5);
    shooterCtx.lineTo(shooterPlayer.x + 10, shooterPlayer.y + 10);
    shooterCtx.closePath();
    shooterCtx.fill();

    // Engine glow
    shooterCtx.fillStyle = '#FFFF00';
    shooterCtx.beginPath();
    shooterCtx.arc(shooterPlayer.x, shooterPlayer.y + 10, 3, 0, Math.PI * 2);
    shooterCtx.fill();

    // UI
    shooterCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    shooterCtx.fillRect(0, 0, 400, 40);

    shooterCtx.fillStyle = '#00FFFF';
    shooterCtx.font = 'bold 14px Arial';
    shooterCtx.fillText(`Health: ${shooterPlayer.health}`, 10, 20);
    shooterCtx.fillText(`Score: ${shooterPlayer.score}`, 150, 20);
    shooterCtx.fillText(`Enemies: ${shooterEnemies.length}`, 280, 20);

    requestAnimationFrame(shooterGameLoop);
}

function spawnShooterEnemy() {
    if(!shooterRunning) return;

    shooterEnemies.push({
        x: Math.random() * 380 + 10,
        y: 0,
        speed: Math.random() * 2 + 1,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`
    });
}

function handleShooterKeys(e) {
    if(!shooterRunning) return;

    const speed = 5;
    switch(e.key) {
        case 'a': case 'A': case 'ArrowLeft':
            if(shooterPlayer.x > 15) shooterPlayer.x -= speed;
            break;
        case 'd': case 'D': case 'ArrowRight':
            if(shooterPlayer.x < 385) shooterPlayer.x += speed;
            break;
        case 'w': case 'W': case 'ArrowUp':
            if(shooterPlayer.y > 15) shooterPlayer.y -= speed;
            break;
        case 's': case 'S': case 'ArrowDown':
            if(shooterPlayer.y < 285) shooterPlayer.y += speed;
            break;
        case ' ':
            shooterBullets.push({x: shooterPlayer.x, y: shooterPlayer.y - 10});
            break;
    }
}

function shooterGameOver() {
    shooterCtx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    shooterCtx.fillRect(0, 0, 400, 300);

    shooterCtx.fillStyle = '#FF0000';
    shooterCtx.font = 'bold 28px Arial';
    shooterCtx.textAlign = 'center';
    shooterCtx.fillText('GAME OVER', 200, 120);

    shooterCtx.fillStyle = '#FFFF00';
    shooterCtx.font = '18px Arial';
    shooterCtx.fillText(`Final Score: ${shooterPlayer.score}`, 200, 160);
}

// Initialize all games on load
setTimeout(() => {
    // Initialize start screens for all games
    const canvas1 = document.getElementById('snakeGame');
    const ctx1 = canvas1.getContext('2d');
    ctx1.fillStyle = '#001122';
    ctx1.fillRect(0, 0, 400, 300);
    ctx1.fillStyle = '#00FF00';
    ctx1.font = 'bold 24px Arial';
    ctx1.textAlign = 'center';
    ctx1.fillText('🐍 NEON SNAKE ARENA', 200, 150);

    // Add similar initialization for other games...
}, 1000);