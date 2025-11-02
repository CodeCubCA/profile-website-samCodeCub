// Simple Working Snake Game
let snakeGame = {
    canvas: null,
    ctx: null,
    gridSize: 20,
    tileCount: 0,
    snake: [{x: 10, y: 10}],
    food: {x: 15, y: 15},
    dx: 0,
    dy: 0,
    score: 0,
    running: false,
    gameLoop: null
};

function startSnake() {
    snakeGame.canvas = document.getElementById('snakeGame');
    snakeGame.ctx = snakeGame.canvas.getContext('2d');
    snakeGame.tileCount = snakeGame.canvas.width / snakeGame.gridSize;

    // Reset game state
    snakeGame.snake = [{x: 10, y: 10}];
    snakeGame.food = {x: 15, y: 15};
    snakeGame.dx = 0;
    snakeGame.dy = 0;
    snakeGame.score = 0;
    snakeGame.running = true;

    // Clear any existing game loop
    if (snakeGame.gameLoop) {
        clearInterval(snakeGame.gameLoop);
    }

    // Set up controls
    document.addEventListener('keydown', handleSnakeInput);

    // Create food
    createFood();

    // Start game loop
    snakeGame.gameLoop = setInterval(updateSnakeGame, 100);
}

function updateSnakeGame() {
    if (!snakeGame.running) return;

    moveSnake();
    if (checkCollision()) {
        gameOver();
        return;
    }

    checkFoodCollision();
    drawGame();
}

function moveSnake() {
    if (snakeGame.dx === 0 && snakeGame.dy === 0) return;

    const head = {
        x: snakeGame.snake[0].x + snakeGame.dx,
        y: snakeGame.snake[0].y + snakeGame.dy
    };

    snakeGame.snake.unshift(head);
    snakeGame.snake.pop();
}

function checkCollision() {
    const head = snakeGame.snake[0];

    // Wall collision
    if (head.x < 0 || head.x >= snakeGame.tileCount || head.y < 0 || head.y >= snakeGame.tileCount) {
        return true;
    }

    // Self collision
    for (let i = 1; i < snakeGame.snake.length; i++) {
        if (head.x === snakeGame.snake[i].x && head.y === snakeGame.snake[i].y) {
            return true;
        }
    }

    return false;
}

function checkFoodCollision() {
    const head = snakeGame.snake[0];

    if (head.x === snakeGame.food.x && head.y === snakeGame.food.y) {
        snakeGame.score += 10;

        // Grow snake
        snakeGame.snake.push({...snakeGame.snake[snakeGame.snake.length - 1]});

        createFood();
    }
}

function createFood() {
    snakeGame.food = {
        x: Math.floor(Math.random() * snakeGame.tileCount),
        y: Math.floor(Math.random() * snakeGame.tileCount)
    };

    // Make sure food doesn't spawn on snake
    for (let segment of snakeGame.snake) {
        if (segment.x === snakeGame.food.x && segment.y === snakeGame.food.y) {
            createFood();
            return;
        }
    }
}

function drawGame() {
    // Clear canvas
    snakeGame.ctx.fillStyle = '#000';
    snakeGame.ctx.fillRect(0, 0, snakeGame.canvas.width, snakeGame.canvas.height);

    // Draw snake
    snakeGame.ctx.fillStyle = '#0f0';
    for (let i = 0; i < snakeGame.snake.length; i++) {
        const segment = snakeGame.snake[i];
        snakeGame.ctx.fillStyle = i === 0 ? '#ff0' : '#0f0'; // Head is yellow
        snakeGame.ctx.fillRect(
            segment.x * snakeGame.gridSize,
            segment.y * snakeGame.gridSize,
            snakeGame.gridSize - 2,
            snakeGame.gridSize - 2
        );
    }

    // Draw food
    snakeGame.ctx.fillStyle = '#f00';
    snakeGame.ctx.fillRect(
        snakeGame.food.x * snakeGame.gridSize,
        snakeGame.food.y * snakeGame.gridSize,
        snakeGame.gridSize - 2,
        snakeGame.gridSize - 2
    );

    // Draw score
    snakeGame.ctx.fillStyle = '#fff';
    snakeGame.ctx.font = '20px Arial';
    snakeGame.ctx.fillText(`Score: ${snakeGame.score}`, 10, 30);
}

function handleSnakeInput(event) {
    if (!snakeGame.running) return;

    const keyPressed = event.keyCode;
    const goingUp = snakeGame.dy === -1;
    const goingDown = snakeGame.dy === 1;
    const goingRight = snakeGame.dx === 1;
    const goingLeft = snakeGame.dx === -1;

    if ((keyPressed === 37 || keyPressed === 65) && !goingRight) { // Left or A
        snakeGame.dx = -1;
        snakeGame.dy = 0;
    }
    if ((keyPressed === 38 || keyPressed === 87) && !goingDown) { // Up or W
        snakeGame.dx = 0;
        snakeGame.dy = -1;
    }
    if ((keyPressed === 39 || keyPressed === 68) && !goingLeft) { // Right or D
        snakeGame.dx = 1;
        snakeGame.dy = 0;
    }
    if ((keyPressed === 40 || keyPressed === 83) && !goingUp) { // Down or S
        snakeGame.dx = 0;
        snakeGame.dy = 1;
    }
}

function gameOver() {
    snakeGame.running = false;
    clearInterval(snakeGame.gameLoop);

    snakeGame.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    snakeGame.ctx.fillRect(0, 0, snakeGame.canvas.width, snakeGame.canvas.height);

    snakeGame.ctx.fillStyle = '#fff';
    snakeGame.ctx.font = 'bold 30px Arial';
    snakeGame.ctx.textAlign = 'center';
    snakeGame.ctx.fillText('GAME OVER', snakeGame.canvas.width / 2, snakeGame.canvas.height / 2 - 30);
    snakeGame.ctx.fillText(`Score: ${snakeGame.score}`, snakeGame.canvas.width / 2, snakeGame.canvas.height / 2 + 10);
    snakeGame.ctx.font = '16px Arial';
    snakeGame.ctx.fillText('Press Start Snake to play again', snakeGame.canvas.width / 2, snakeGame.canvas.height / 2 + 40);
    snakeGame.ctx.textAlign = 'left';
}

// Fullscreen for snake
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
            canvas.style.width = '400px';
            canvas.style.height = '300px';
            canvas.style.objectFit = 'initial';
        });
    }
}