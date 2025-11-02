// Advanced Snake Game with Graphics and Effects
class AdvancedSnakeGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gridSize = 20;
        this.tileCount = 0;
        this.snake = [{x: 10, y: 10}];
        this.food = {x: 15, y: 15, type: 'normal'};
        this.powerUps = [];
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.running = false;
        this.gameLoop = null;
        this.particles = [];
        this.trails = [];
        this.animationFrame = 0;
        this.speed = 150;
        this.powerUpSpawnTimer = 0;
        this.backgroundStars = [];
        this.gameStartTime = 0;
        this.showGrid = true;

        this.colors = {
            background: '#0a0a1a',
            snake: {
                head: '#00ff88',
                body: '#00cc66',
                shadow: '#004422'
            },
            food: {
                normal: '#ff3366',
                special: '#ffaa00',
                glow: '#ff6699'
            },
            powerUp: '#8833ff',
            particle: '#00ffff',
            grid: 'rgba(255, 255, 255, 0.05)',
            ui: '#ffffff'
        };

        this.initBackgroundStars();
    }

    initBackgroundStars() {
        this.backgroundStars = [];
        for (let i = 0; i < 50; i++) {
            this.backgroundStars.push({
                x: Math.random() * 800,
                y: Math.random() * 600,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.3,
                twinkle: Math.random() * Math.PI * 2
            });
        }
    }

    start() {
        this.canvas = document.getElementById('snakeGame');
        this.ctx = this.canvas.getContext('2d');
        this.tileCount = Math.floor(this.canvas.width / this.gridSize);

        // Reset game state
        this.snake = [{x: Math.floor(this.tileCount/2), y: Math.floor(this.tileCount/2)}];
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.running = true;
        this.particles = [];
        this.trails = [];
        this.powerUps = [];
        this.animationFrame = 0;
        this.powerUpSpawnTimer = 0;
        this.gameStartTime = Date.now();

        // Clear any existing game loop
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }

        // Set up controls
        document.removeEventListener('keydown', this.handleInput);
        document.addEventListener('keydown', (e) => this.handleInput(e));

        // Create initial food
        this.createFood();

        // Start game loop
        this.gameLoop = setInterval(() => this.update(), this.speed);
    }

    update() {
        if (!this.running) return;

        this.animationFrame++;
        this.powerUpSpawnTimer++;

        // Spawn power-ups occasionally
        if (this.powerUpSpawnTimer > 100 && Math.random() < 0.02) {
            this.spawnPowerUp();
            this.powerUpSpawnTimer = 0;
        }

        this.moveSnake();
        if (this.checkCollision()) {
            this.gameOver();
            return;
        }

        this.checkFoodCollision();
        this.checkPowerUpCollision();
        this.updateParticles();
        this.updateTrails();
        this.draw();
    }

    moveSnake() {
        if (this.dx === 0 && this.dy === 0) return;

        const head = {
            x: this.snake[0].x + this.dx,
            y: this.snake[0].y + this.dy
        };

        // Add trail effect
        this.trails.push({
            x: this.snake[0].x * this.gridSize + this.gridSize/2,
            y: this.snake[0].y * this.gridSize + this.gridSize/2,
            life: 15,
            maxLife: 15
        });

        this.snake.unshift(head);
        this.snake.pop();
    }

    checkCollision() {
        const head = this.snake[0];

        // Wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.createExplosion(head.x * this.gridSize, head.y * this.gridSize, this.colors.snake.head);
            return true;
        }

        // Self collision
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                this.createExplosion(head.x * this.gridSize, head.y * this.gridSize, this.colors.snake.head);
                return true;
            }
        }

        return false;
    }

    checkFoodCollision() {
        const head = this.snake[0];

        if (head.x === this.food.x && head.y === this.food.y) {
            const points = this.food.type === 'special' ? 50 : 10;
            this.score += points;

            // Create food explosion effect
            this.createExplosion(
                this.food.x * this.gridSize + this.gridSize/2,
                this.food.y * this.gridSize + this.gridSize/2,
                this.food.type === 'special' ? this.colors.food.special : this.colors.food.normal
            );

            // Grow snake
            this.snake.push({...this.snake[this.snake.length - 1]});

            // Speed up slightly
            if (this.speed > 80) {
                this.speed -= 2;
                clearInterval(this.gameLoop);
                this.gameLoop = setInterval(() => this.update(), this.speed);
            }

            this.createFood();
        }
    }

    checkPowerUpCollision() {
        const head = this.snake[0];

        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            if (head.x === powerUp.x && head.y === powerUp.y) {
                this.score += 100;
                this.createExplosion(
                    powerUp.x * this.gridSize + this.gridSize/2,
                    powerUp.y * this.gridSize + this.gridSize/2,
                    this.colors.powerUp
                );

                // Power-up effect: double score for next few foods
                this.powerUps.splice(i, 1);
            }
        }
    }

    createFood() {
        // 20% chance for special food
        const isSpecial = Math.random() < 0.2;

        do {
            this.food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount),
                type: isSpecial ? 'special' : 'normal',
                pulse: 0
            };
        } while (this.isPositionOccupied(this.food.x, this.food.y));
    }

    spawnPowerUp() {
        if (this.powerUps.length >= 2) return;

        let powerUp;
        do {
            powerUp = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount),
                life: 200,
                pulse: 0
            };
        } while (this.isPositionOccupied(powerUp.x, powerUp.y));

        this.powerUps.push(powerUp);
    }

    isPositionOccupied(x, y) {
        // Check snake
        for (let segment of this.snake) {
            if (segment.x === x && segment.y === y) return true;
        }

        // Check food
        if (this.food.x === x && this.food.y === y) return true;

        // Check power-ups
        for (let powerUp of this.powerUps) {
            if (powerUp.x === x && powerUp.y === y) return true;
        }

        return false;
    }

    createExplosion(x, y, color) {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 30,
                maxLife: 30,
                color: color,
                size: Math.random() * 4 + 2
            });
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            particle.vx *= 0.98;
            particle.vy *= 0.98;

            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    updateTrails() {
        for (let i = this.trails.length - 1; i >= 0; i--) {
            const trail = this.trails[i];
            trail.life--;

            if (trail.life <= 0) {
                this.trails.splice(i, 1);
            }
        }
    }

    draw() {
        // Create gradient background
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width/2, this.canvas.height/2, 0,
            this.canvas.width/2, this.canvas.height/2, Math.max(this.canvas.width, this.canvas.height)/2
        );
        gradient.addColorStop(0, '#1a1a3a');
        gradient.addColorStop(1, this.colors.background);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw animated background stars
        this.drawBackgroundStars();

        // Draw grid with animation
        if (this.showGrid) {
            this.drawAnimatedGrid();
        }

        // Draw trails
        this.drawTrails();

        // Draw snake with glow effect
        this.drawSnake();

        // Draw food with pulsing effect
        this.drawFood();

        // Draw power-ups
        this.drawPowerUps();

        // Draw particles
        this.drawParticles();

        // Draw UI
        this.drawUI();
    }

    drawBackgroundStars() {
        this.ctx.save();
        for (let star of this.backgroundStars) {
            const twinkle = Math.sin(this.animationFrame * 0.05 + star.twinkle) * 0.3 + 0.7;
            this.ctx.globalAlpha = star.opacity * twinkle;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.restore();
    }

    drawAnimatedGrid() {
        this.ctx.save();
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.3 + Math.sin(this.animationFrame * 0.02) * 0.2;

        for (let i = 0; i <= this.tileCount; i++) {
            // Vertical lines
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();

            // Horizontal lines
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
        this.ctx.restore();
    }

    drawTrails() {
        this.ctx.save();
        for (let trail of this.trails) {
            const opacity = trail.life / trail.maxLife;
            this.ctx.globalAlpha = opacity * 0.3;
            this.ctx.fillStyle = this.colors.snake.shadow;
            this.ctx.beginPath();
            this.ctx.arc(trail.x, trail.y, 3 * opacity, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.restore();
    }

    drawSnake() {
        this.ctx.save();

        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            const isHead = i === 0;

            // Draw glow effect
            this.ctx.shadowColor = isHead ? this.colors.snake.head : this.colors.snake.body;
            this.ctx.shadowBlur = isHead ? 20 : 10;

            // Draw segment
            const color = isHead ? this.colors.snake.head : this.colors.snake.body;
            this.ctx.fillStyle = color;

            if (isHead) {
                // Draw head with animation
                const pulse = Math.sin(this.animationFrame * 0.2) * 2;
                this.ctx.fillRect(x - pulse, y - pulse, this.gridSize + pulse * 2, this.gridSize + pulse * 2);

                // Draw eyes
                this.ctx.shadowBlur = 0;
                this.ctx.fillStyle = '#ffffff';
                const eyeSize = 3;
                const eyeOffset = 5;

                if (this.dx === 1) { // Moving right
                    this.ctx.fillRect(x + this.gridSize - eyeOffset, y + 4, eyeSize, eyeSize);
                    this.ctx.fillRect(x + this.gridSize - eyeOffset, y + this.gridSize - 7, eyeSize, eyeSize);
                } else if (this.dx === -1) { // Moving left
                    this.ctx.fillRect(x + 2, y + 4, eyeSize, eyeSize);
                    this.ctx.fillRect(x + 2, y + this.gridSize - 7, eyeSize, eyeSize);
                } else if (this.dy === -1) { // Moving up
                    this.ctx.fillRect(x + 4, y + 2, eyeSize, eyeSize);
                    this.ctx.fillRect(x + this.gridSize - 7, y + 2, eyeSize, eyeSize);
                } else if (this.dy === 1) { // Moving down
                    this.ctx.fillRect(x + 4, y + this.gridSize - eyeOffset, eyeSize, eyeSize);
                    this.ctx.fillRect(x + this.gridSize - 7, y + this.gridSize - eyeOffset, eyeSize, eyeSize);
                }
            } else {
                // Draw body segment
                const intensity = (this.snake.length - i) / this.snake.length;
                this.ctx.globalAlpha = 0.7 + intensity * 0.3;
                this.ctx.fillRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2);
            }
        }

        this.ctx.restore();
    }

    drawFood() {
        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;

        this.ctx.save();

        // Pulsing effect
        this.food.pulse += 0.3;
        const pulseSize = Math.sin(this.food.pulse) * 3;

        // Glow effect
        this.ctx.shadowColor = this.food.type === 'special' ? this.colors.food.special : this.colors.food.normal;
        this.ctx.shadowBlur = 25 + pulseSize;

        // Draw food
        this.ctx.fillStyle = this.food.type === 'special' ? this.colors.food.special : this.colors.food.normal;
        this.ctx.fillRect(x - pulseSize, y - pulseSize, this.gridSize + pulseSize * 2, this.gridSize + pulseSize * 2);

        // Inner glow
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = this.colors.food.glow;
        this.ctx.fillRect(x + 4, y + 4, this.gridSize - 8, this.gridSize - 8);

        this.ctx.restore();
    }

    drawPowerUps() {
        this.ctx.save();

        for (let powerUp of this.powerUps) {
            powerUp.pulse += 0.2;
            powerUp.life--;

            if (powerUp.life <= 0) continue;

            const x = powerUp.x * this.gridSize;
            const y = powerUp.y * this.gridSize;
            const pulse = Math.sin(powerUp.pulse) * 4;
            const opacity = powerUp.life > 50 ? 1 : powerUp.life / 50;

            this.ctx.globalAlpha = opacity;
            this.ctx.shadowColor = this.colors.powerUp;
            this.ctx.shadowBlur = 20;
            this.ctx.fillStyle = this.colors.powerUp;

            // Rotating square effect
            this.ctx.save();
            this.ctx.translate(x + this.gridSize/2, y + this.gridSize/2);
            this.ctx.rotate(powerUp.pulse * 0.1);
            this.ctx.fillRect(-this.gridSize/2 - pulse, -this.gridSize/2 - pulse, this.gridSize + pulse * 2, this.gridSize + pulse * 2);
            this.ctx.restore();
        }

        // Remove expired power-ups
        this.powerUps = this.powerUps.filter(p => p.life > 0);

        this.ctx.restore();
    }

    drawParticles() {
        this.ctx.save();

        for (let particle of this.particles) {
            const opacity = particle.life / particle.maxLife;
            this.ctx.globalAlpha = opacity;
            this.ctx.fillStyle = particle.color;
            this.ctx.shadowColor = particle.color;
            this.ctx.shadowBlur = 10;

            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * opacity, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.restore();
    }

    drawUI() {
        this.ctx.save();
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = 5;
        this.ctx.fillStyle = this.colors.ui;
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 10, 35);

        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Length: ${this.snake.length}`, 10, 60);
        this.ctx.fillText(`Speed: ${Math.round((200 - this.speed) / 2)}`, 10, 80);

        // Game time
        const gameTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
        this.ctx.fillText(`Time: ${gameTime}s`, 10, 100);

        this.ctx.restore();
    }

    handleInput(event) {
        if (!this.running) return;

        const keyPressed = event.keyCode;
        const goingUp = this.dy === -1;
        const goingDown = this.dy === 1;
        const goingRight = this.dx === 1;
        const goingLeft = this.dx === -1;

        if ((keyPressed === 37 || keyPressed === 65) && !goingRight) { // Left or A
            this.dx = -1;
            this.dy = 0;
        }
        if ((keyPressed === 38 || keyPressed === 87) && !goingDown) { // Up or W
            this.dx = 0;
            this.dy = -1;
        }
        if ((keyPressed === 39 || keyPressed === 68) && !goingLeft) { // Right or D
            this.dx = 1;
            this.dy = 0;
        }
        if ((keyPressed === 40 || keyPressed === 83) && !goingUp) { // Down or S
            this.dx = 0;
            this.dy = 1;
        }

        // Toggle grid with G key
        if (keyPressed === 71) { // G key
            this.showGrid = !this.showGrid;
        }
    }

    gameOver() {
        this.running = false;
        clearInterval(this.gameLoop);

        // Final explosion
        this.createExplosion(this.canvas.width/2, this.canvas.height/2, this.colors.snake.head);

        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.shadowColor = 'rgba(255, 0, 0, 0.8)';
        this.ctx.shadowBlur = 20;
        this.ctx.fillStyle = '#ff3366';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 40);

        this.ctx.shadowBlur = 10;
        this.ctx.fillStyle = '#ffaa00';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);

        this.ctx.shadowBlur = 5;
        this.ctx.fillStyle = '#00ffff';
        this.ctx.font = '18px Arial';
        this.ctx.fillText(`Length: ${this.snake.length} | Time: ${Math.floor((Date.now() - this.gameStartTime) / 1000)}s`, this.canvas.width / 2, this.canvas.height / 2 + 30);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Press Start Snake to play again', this.canvas.width / 2, this.canvas.height / 2 + 60);
        this.ctx.fillText('Press G during game to toggle grid', this.canvas.width / 2, this.canvas.height / 2 + 80);

        this.ctx.textAlign = 'left';
        this.ctx.restore();
    }
}

// Global instance
const advancedSnake = new AdvancedSnakeGame();

// Global functions for HTML buttons
function startSnake() {
    advancedSnake.start();
}

function toggleFullscreen(canvasId) {
    if (canvasId !== 'snakeGame') return;

    const canvas = document.getElementById(canvasId);
    if (!document.fullscreenElement) {
        canvas.requestFullscreen().then(() => {
            canvas.style.width = '100vw';
            canvas.style.height = '100vh';
            canvas.style.objectFit = 'contain';
            canvas.style.backgroundColor = '#000';
        }).catch(err => {
            console.log('Fullscreen failed:', err);
        });
    } else {
        document.exitFullscreen().then(() => {
            canvas.style.width = '400px';
            canvas.style.height = '300px';
            canvas.style.objectFit = 'initial';
            canvas.style.backgroundColor = 'transparent';
        });
    }
}