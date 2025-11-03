// Working Advanced Snake Game
class WorkingSnake {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gridSize = 20;
        this.snake = [{x: 10, y: 10}];
        this.food = {x: 15, y: 15};
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.running = false;
        this.gameLoop = null;
        this.particles = [];
        this.animationFrame = 0;
    }

    start() {
        console.log('Starting Snake Game...');
        this.canvas = document.getElementById('snakeGame');
        if (!this.canvas) {
            console.error('Canvas not found!');
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.tileCountX = Math.floor(this.canvas.width / this.gridSize);
        this.tileCountY = Math.floor(this.canvas.height / this.gridSize);

        // Reset game
        this.snake = [{x: Math.floor(this.tileCountX/2), y: Math.floor(this.tileCountY/2)}];
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.running = true;
        this.particles = [];
        this.animationFrame = 0;

        // Clear any existing game loop
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }

        // Remove old event listeners
        document.removeEventListener('keydown', this.boundKeyHandler);

        // Add new event listener
        this.boundKeyHandler = (e) => this.handleInput(e);
        document.addEventListener('keydown', this.boundKeyHandler);

        this.createFood();
        this.gameLoop = setInterval(() => this.update(), 120);

        console.log('Game started successfully!');
    }

    update() {
        if (!this.running) return;

        this.animationFrame++;
        this.moveSnake();

        if (this.checkCollision()) {
            this.gameOver();
            return;
        }

        this.checkFoodCollision();
        this.updateParticles();
        this.draw();
    }

    moveSnake() {
        if (this.dx === 0 && this.dy === 0) return;

        const head = {
            x: this.snake[0].x + this.dx,
            y: this.snake[0].y + this.dy
        };

        this.snake.unshift(head);
        this.snake.pop();
    }

    checkCollision() {
        const head = this.snake[0];

        // Wall collision
        if (head.x < 0 || head.x >= this.tileCountX || head.y < 0 || head.y >= this.tileCountY) {
            this.createExplosion(head.x * this.gridSize, head.y * this.gridSize);
            return true;
        }

        // Self collision
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                this.createExplosion(head.x * this.gridSize, head.y * this.gridSize);
                return true;
            }
        }

        return false;
    }

    checkFoodCollision() {
        const head = this.snake[0];

        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.createExplosion(this.food.x * this.gridSize + 10, this.food.y * this.gridSize + 10);

            // Grow snake
            this.snake.push({...this.snake[this.snake.length - 1]});
            this.createFood();
        }
    }

    createFood() {
        do {
            this.food = {
                x: Math.floor(Math.random() * this.tileCountX),
                y: Math.floor(Math.random() * this.tileCountY)
            };
        } while (this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y));
    }

    createExplosion(x, y) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 30,
                maxLife: 30,
                color: `hsl(${Math.random() * 360}, 70%, 60%)`
            });
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            particle.vx *= 0.95;
            particle.vy *= 0.95;

            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw() {
        // Clear canvas with gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.tileCountX; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
        }
        for (let i = 0; i <= this.tileCountY; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }

        // Draw snake with glow
        this.ctx.shadowBlur = 10;
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;

            if (i === 0) {
                // Head
                this.ctx.shadowColor = '#00ff88';
                this.ctx.fillStyle = '#00ff88';
                this.ctx.fillRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2);

                // Eyes
                this.ctx.shadowBlur = 0;
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(x + 4, y + 4, 3, 3);
                this.ctx.fillRect(x + this.gridSize - 7, y + 4, 3, 3);
            } else {
                // Body
                this.ctx.shadowColor = '#00cc66';
                this.ctx.fillStyle = '#00cc66';
                this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
            }
        }

        // Draw food with pulsing effect
        const pulse = Math.sin(this.animationFrame * 0.2) * 3;
        this.ctx.shadowColor = '#ff3366';
        this.ctx.shadowBlur = 15;
        this.ctx.fillStyle = '#ff3366';
        this.ctx.fillRect(
            this.food.x * this.gridSize - pulse,
            this.food.y * this.gridSize - pulse,
            this.gridSize + pulse * 2,
            this.gridSize + pulse * 2
        );

        // Draw particles
        this.ctx.shadowBlur = 5;
        for (let particle of this.particles) {
            const opacity = particle.life / particle.maxLife;
            this.ctx.globalAlpha = opacity;
            this.ctx.shadowColor = particle.color;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Reset alpha and shadow
        this.ctx.globalAlpha = 1;
        this.ctx.shadowBlur = 0;

        // Draw UI
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Length: ${this.snake.length}`, 10, 55);
    }

    handleInput(event) {
        if (!this.running) return;

        const key = event.keyCode;
        const goingUp = this.dy === -1;
        const goingDown = this.dy === 1;
        const goingRight = this.dx === 1;
        const goingLeft = this.dx === -1;

        // Prevent default to stop page scrolling
        if ([37, 38, 39, 40, 65, 83, 68, 87].includes(key)) {
            event.preventDefault();
        }

        if ((key === 37 || key === 65) && !goingRight) { // Left or A
            this.dx = -1;
            this.dy = 0;
        }
        if ((key === 38 || key === 87) && !goingDown) { // Up or W
            this.dx = 0;
            this.dy = -1;
        }
        if ((key === 39 || key === 68) && !goingLeft) { // Right or D
            this.dx = 1;
            this.dy = 0;
        }
        if ((key === 40 || key === 83) && !goingUp) { // Down or S
            this.dx = 0;
            this.dy = 1;
        }
    }

    gameOver() {
        this.running = false;
        clearInterval(this.gameLoop);

        // Game over screen
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#ff3366';
        this.ctx.font = 'bold 30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 30);

        this.ctx.fillStyle = '#ffaa00';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Click "Start Game" to play again', this.canvas.width / 2, this.canvas.height / 2 + 40);

        this.ctx.textAlign = 'left';
    }
}

// Create global instance
const gameInstance = new WorkingSnake();

// Global functions for buttons
function startSnake() {
    console.log('Start button clicked');
    gameInstance.start();
}

function toggleFullscreen(canvasId) {
    if (canvasId !== 'snakeGame') return;

    const canvas = document.getElementById(canvasId);
    if (!document.fullscreenElement) {
        canvas.requestFullscreen().then(() => {
            canvas.style.width = '100vw';
            canvas.style.height = '100vh';
            canvas.style.objectFit = 'contain';
        }).catch(err => {
            console.log('Fullscreen failed:', err);
        });
    } else {
        document.exitFullscreen().then(() => {
            canvas.style.width = '';
            canvas.style.height = '';
            canvas.style.objectFit = 'initial';
        });
    }
}

console.log('Snake game script loaded successfully');