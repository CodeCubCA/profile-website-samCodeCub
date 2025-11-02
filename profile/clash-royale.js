// Clash Royale Tower Defense Game
class ClashRoyale {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.running = false;
        this.gameLoop = null;

        // Game state
        this.elixir = 10;
        this.maxElixir = 10;
        this.selectedCard = null;
        this.playerScore = 0;
        this.enemyScore = 0;

        // Game objects
        this.units = [];
        this.buildings = [];
        this.projectiles = [];
        this.particles = [];
        this.aiUnits = [];

        // Game timing
        this.lastElixirTime = 0;
        this.lastAiActionTime = 0;
        this.gameStartTime = 0;
        this.lastCardPickTime = 0;
        this.lastAiCardPickTime = 0; // AI card cooldown timer
        this.cardCooldownTime = 5000; // 5 seconds in milliseconds

        // Game dimensions
        this.canvasWidth = 480;
        this.canvasHeight = 360;

        // Message system
        this.messages = [];
        this.bridgeY = this.canvasHeight / 2;

        // Unit definitions
        this.unitTypes = {
            knight: {
                cost: 3,
                health: 100,
                damage: 25,
                speed: 1.5,
                range: 30,
                size: 15,
                color: '#4A90E2',
                emoji: '🛡️',
                attackSpeed: 1000
            },
            archer: {
                cost: 3,
                health: 60,
                damage: 20,
                speed: 2,
                range: 80,
                size: 12,
                color: '#10B981',
                emoji: '🏹',
                attackSpeed: 800
            },
            giant: {
                cost: 5,
                health: 300,
                damage: 40,
                speed: 1,
                range: 25,
                size: 25,
                color: '#8B5CF6',
                emoji: '🗿',
                attackSpeed: 1500
            },
            wizard: {
                cost: 5,
                health: 80,
                damage: 35,
                speed: 1.8,
                range: 100,
                size: 14,
                color: '#F59E0B',
                emoji: '🧙',
                attackSpeed: 1200
            }
        };

        // Initialize towers (Clash Royale style: King Tower + 2 Princess Towers)
        this.playerKingTower = {
            x: this.canvasWidth / 2,
            y: this.canvasHeight - 60,
            health: 500,
            maxHealth: 500,
            size: 45,
            range: 140,
            type: 'king'
        };

        this.playerLeftTower = {
            x: this.canvasWidth / 2 - 120,
            y: this.canvasHeight - 100,
            health: 300,
            maxHealth: 300,
            size: 35,
            range: 120,
            type: 'princess'
        };

        this.playerRightTower = {
            x: this.canvasWidth / 2 + 120,
            y: this.canvasHeight - 100,
            health: 300,
            maxHealth: 300,
            size: 35,
            range: 120,
            type: 'princess'
        };

        this.enemyKingTower = {
            x: this.canvasWidth / 2,
            y: 60,
            health: 500,
            maxHealth: 500,
            size: 45,
            range: 140,
            type: 'king'
        };

        this.enemyLeftTower = {
            x: this.canvasWidth / 2 - 120,
            y: 100,
            health: 300,
            maxHealth: 300,
            size: 35,
            range: 120,
            type: 'princess'
        };

        this.enemyRightTower = {
            x: this.canvasWidth / 2 + 120,
            y: 100,
            health: 300,
            maxHealth: 300,
            size: 35,
            range: 120,
            type: 'princess'
        };

        // Legacy references for compatibility
        this.playerTower = this.playerKingTower;
        this.enemyTower = this.enemyKingTower;

        this.initializeEventListeners();
    }

    updateTowerPositions() {
        // Update King Towers
        this.playerKingTower.x = this.canvasWidth / 2;
        this.playerKingTower.y = this.canvasHeight - 60;
        this.enemyKingTower.x = this.canvasWidth / 2;
        this.enemyKingTower.y = 60;

        // Update Princess Towers
        this.playerLeftTower.x = this.canvasWidth / 2 - 120;
        this.playerLeftTower.y = this.canvasHeight - 100;
        this.playerRightTower.x = this.canvasWidth / 2 + 120;
        this.playerRightTower.y = this.canvasHeight - 100;

        this.enemyLeftTower.x = this.canvasWidth / 2 - 120;
        this.enemyLeftTower.y = 100;
        this.enemyRightTower.x = this.canvasWidth / 2 + 120;
        this.enemyRightTower.y = 100;

        this.bridgeY = this.canvasHeight / 2;

        // Update legacy references
        this.playerTower = this.playerKingTower;
        this.enemyTower = this.enemyKingTower;
    }

    initializeEventListeners() {
        // Card selection with improved touch handling
        document.addEventListener('click', (e) => {
            if (e.target.closest('.card')) {
                e.preventDefault();
                this.selectCard(e.target.closest('.card'));
            }
        });

        // Touch support for mobile
        document.addEventListener('touchend', (e) => {
            if (e.target.closest('.card')) {
                e.preventDefault();
                this.selectCard(e.target.closest('.card'));
            }
        });

        // Prevent default touch behaviors on cards
        document.addEventListener('touchstart', (e) => {
            if (e.target.closest('.card')) {
                e.preventDefault();
            }
        });
    }

    start() {
        console.log('Starting Clash Royale...');
        this.canvas = document.getElementById('clashGame');
        if (!this.canvas) {
            console.error('Canvas not found!');
            return;
        }

        // Set canvas dimensions properly
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        this.canvas.style.maxWidth = '100%';
        this.canvas.style.height = 'auto';

        this.ctx = this.canvas.getContext('2d');
        this.running = true;
        this.gameStartTime = Date.now();

        // Update tower positions for current canvas size
        this.updateTowerPositions();

        // Reset game state
        this.elixir = 10;
        this.selectedCard = null;
        this.playerScore = 0;
        this.enemyScore = 0;
        this.units = [];
        this.aiUnits = [];
        this.projectiles = [];
        this.particles = [];

        // Reset tower health
        // Reset all tower health
        this.playerKingTower.health = this.playerKingTower.maxHealth;
        this.playerLeftTower.health = this.playerLeftTower.maxHealth;
        this.playerRightTower.health = this.playerRightTower.maxHealth;

        this.enemyKingTower.health = this.enemyKingTower.maxHealth;
        this.enemyLeftTower.health = this.enemyLeftTower.maxHealth;
        this.enemyRightTower.health = this.enemyRightTower.maxHealth;

        // Remove existing event listeners to prevent duplicates
        this.canvas.removeEventListener('click', this.handleCanvasClick);
        this.canvas.removeEventListener('touchend', this.handleCanvasTouch);

        // Add canvas click handler for unit deployment
        this.handleCanvasClick = this.handleCanvasClick.bind(this);
        this.handleCanvasTouch = this.handleCanvasTouch.bind(this);

        this.canvas.addEventListener('click', this.handleCanvasClick);
        this.canvas.addEventListener('touchend', this.handleCanvasTouch);

        // Prevent default touch behaviors on canvas
        this.canvas.addEventListener('touchstart', (e) => e.preventDefault());
        this.canvas.addEventListener('touchmove', (e) => e.preventDefault());

        // Start game loop with requestAnimationFrame for better performance
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }

        const gameLoop = () => {
            if (this.running) {
                this.update();
                requestAnimationFrame(gameLoop);
            }
        };

        requestAnimationFrame(gameLoop);

        this.updateUI();
        console.log('Game started successfully!');
    }

    selectCard(cardElement) {
        const cardType = cardElement.dataset.type;
        const cost = parseInt(cardElement.dataset.cost);
        const currentTime = Date.now();

        // Check card cooldown timer
        if (currentTime - this.lastCardPickTime < this.cardCooldownTime) {
            const remainingTime = Math.ceil((this.cardCooldownTime - (currentTime - this.lastCardPickTime)) / 1000);
            this.showMessage(`Wait ${remainingTime}s before picking another card!`, '#FF6B6B');
            return;
        }

        // Check if card is disabled
        if (cardElement.classList.contains('disabled')) {
            this.showMessage('Not enough elixir!', '#FF6B6B');
            return;
        }

        // Check if player has enough elixir
        if (this.elixir < cost) {
            this.showMessage('Not enough elixir!', '#FF6B6B');
            return;
        }

        // If same card is already selected, deselect it
        if (this.selectedCard === cardType) {
            cardElement.classList.remove('selected');
            this.selectedCard = null;
            this.showMessage('Card deselected', '#FFA500');
            return;
        }

        // Remove previous selection
        document.querySelectorAll('.card').forEach(card => {
            card.classList.remove('selected');
        });

        // Select new card
        cardElement.classList.add('selected');
        this.selectedCard = cardType;
        this.lastCardPickTime = currentTime; // Set cooldown timer
        const unitType = this.unitTypes[cardType];
        this.showMessage(`${unitType.emoji} ${cardType.charAt(0).toUpperCase() + cardType.slice(1)} selected!`, '#10B981');
    }

    handleCanvasClick(e) {
        this.deployUnit(e);
    }

    handleCanvasTouch(e) {
        e.preventDefault();
        const touch = e.changedTouches ? e.changedTouches[0] : e.touches[0];
        if (touch) {
            const event = {
                clientX: touch.clientX,
                clientY: touch.clientY
            };
            this.deployUnit(event);
        }
    }

    deployUnit(e) {
        if (!this.selectedCard || !this.running) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.canvasWidth / rect.width);
        const y = (e.clientY - rect.top) * (this.canvasHeight / rect.height);

        // Only allow deployment in player's half (below bridge + buffer)
        if (y < this.bridgeY + 30) {
            this.showMessage('Cannot deploy in enemy territory!', '#FF6B6B');
            return;
        }

        const unitType = this.unitTypes[this.selectedCard];
        if (!unitType) return;

        // Double check elixir
        if (this.elixir < unitType.cost) {
            this.showMessage('Not enough elixir!', '#FF6B6B');
            return;
        }

        // Check for unit overlap
        const tooClose = this.units.some(unit => {
            return this.getDistance({ x, y }, unit) < unit.size + 20;
        });

        if (tooClose) {
            this.showMessage('Too close to another unit!', '#FF6B6B');
            return;
        }

        // Spend elixir
        this.elixir -= unitType.cost;

        // Create unit
        const unit = {
            ...unitType,
            x: x,
            y: y,
            maxHealth: unitType.health,
            id: Date.now() + Math.random(),
            side: 'player',
            target: null,
            lastAttackTime: 0,
            direction: { x: 0, y: -1 } // Move toward enemy
        };

        this.units.push(unit);
        this.createParticles(x, y, unitType.color, 8);

        // Clear selection
        this.selectedCard = null;
        document.querySelectorAll('.card').forEach(card => {
            card.classList.remove('selected');
        });

        this.updateUI();
        this.showMessage(`${unitType.emoji} deployed!`, unitType.color);
    }

    update() {
        if (!this.running) return;

        // Update elixir
        this.updateElixir();

        // Update units
        this.updateUnits();
        this.updateAiUnits();

        // Update projectiles
        this.updateProjectiles();

        // Update particles
        this.updateParticles();

        // Update messages
        this.updateMessages();

        // AI behavior
        this.updateAI();

        // Check win conditions
        this.checkWinConditions();

        // Draw everything
        this.draw();

        // Update UI
        this.updateUI();
    }

    updateElixir() {
        const now = Date.now();
        if (now - this.lastElixirTime > 2800) { // Gain 1 elixir every 2.8 seconds
            if (this.elixir < this.maxElixir) {
                this.elixir++;
                this.lastElixirTime = now;

                // Show elixir gain effect
                this.createParticles(550, 380, '#9333EA', 4);
            }
        }
    }

    updateUnits() {
        for (let i = this.units.length - 1; i >= 0; i--) {
            const unit = this.units[i];

            // Find nearest target
            this.findTarget(unit);

            // Move toward target or enemy tower
            if (unit.target && unit.target.health > 0) {
                this.moveTowardTarget(unit, unit.target);
                if (this.getDistance(unit, unit.target) <= unit.range) {
                    this.tryAttack(unit, unit.target);
                }
            } else {
                // Move toward nearest enemy tower
                const nearestTower = this.findNearestEnemyTower(unit);
                if (nearestTower) {
                    this.moveTowardTarget(unit, nearestTower);
                    if (this.getDistance(unit, nearestTower) <= unit.range) {
                        this.tryAttack(unit, nearestTower);
                    }
                }
            }

            // Keep units within canvas bounds
            unit.x = Math.max(unit.size, Math.min(this.canvasWidth - unit.size, unit.x));
            unit.y = Math.max(unit.size, Math.min(this.canvasHeight - unit.size, unit.y));

            // Remove dead units
            if (unit.health <= 0) {
                this.createParticles(unit.x, unit.y, '#FF6B6B', 12);
                this.units.splice(i, 1);
            }
        }
    }

    updateAiUnits() {
        for (let i = this.aiUnits.length - 1; i >= 0; i--) {
            const unit = this.aiUnits[i];

            // Find nearest player unit or tower
            let target = this.findNearestPlayerUnit(unit);
            if (!target || target.health <= 0) {
                target = this.findNearestPlayerTower(unit);
            }

            // Move toward target
            this.moveTowardTarget(unit, target);

            // Attack if in range
            if (this.getDistance(unit, target) <= unit.range) {
                this.tryAttack(unit, target);
            }

            // Keep units within canvas bounds
            unit.x = Math.max(unit.size, Math.min(this.canvasWidth - unit.size, unit.x));
            unit.y = Math.max(unit.size, Math.min(this.canvasHeight - unit.size, unit.y));

            // Remove dead units
            if (unit.health <= 0) {
                this.createParticles(unit.x, unit.y, '#FF6B6B', 12);
                this.aiUnits.splice(i, 1);
            }
        }
    }

    updateProjectiles() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];

            proj.x += proj.dx;
            proj.y += proj.dy;
            proj.life--;

            let hit = false;

            // Check collisions
            if (proj.side === 'player') {
                // Check AI unit collisions
                for (let j = 0; j < this.aiUnits.length; j++) {
                    const unit = this.aiUnits[j];
                    if (unit.health > 0 && this.getDistance(proj, unit) < unit.size) {
                        unit.health -= proj.damage;
                        this.createParticles(proj.x, proj.y, '#FFD700', 6);
                        hit = true;
                        break;
                    }
                }

                // Check enemy tower collisions
                const enemyTowers = [this.enemyKingTower, this.enemyLeftTower, this.enemyRightTower];
                for (const tower of enemyTowers) {
                    if (!hit && tower.health > 0 && this.getDistance(proj, tower) < tower.size) {
                        tower.health -= proj.damage;
                        this.createParticles(proj.x, proj.y, '#FFD700', 6);
                        hit = true;
                        break;
                    }
                }
            } else {
                // Check player unit collisions
                for (let j = 0; j < this.units.length; j++) {
                    const unit = this.units[j];
                    if (unit.health > 0 && this.getDistance(proj, unit) < unit.size) {
                        unit.health -= proj.damage;
                        this.createParticles(proj.x, proj.y, '#FFD700', 6);
                        hit = true;
                        break;
                    }
                }

                // Check player tower collisions
                const playerTowers = [this.playerKingTower, this.playerLeftTower, this.playerRightTower];
                for (const tower of playerTowers) {
                    if (!hit && tower.health > 0 && this.getDistance(proj, tower) < tower.size) {
                        tower.health -= proj.damage;
                        this.createParticles(proj.x, proj.y, '#FFD700', 6);
                        hit = true;
                        break;
                    }
                }
            }

            // Remove hit or expired projectiles
            if (hit || proj.life <= 0 || proj.x < 0 || proj.x > this.canvasWidth ||
                proj.y < 0 || proj.y > this.canvasHeight) {
                this.projectiles.splice(i, 1);
            }
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];

            particle.x += particle.dx;
            particle.y += particle.dy;
            particle.life--;
            particle.dx *= 0.98;
            particle.dy *= 0.98;

            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    updateMessages() {
        for (let i = this.messages.length - 1; i >= 0; i--) {
            const message = this.messages[i];
            message.life--;
            message.y -= 0.5; // Float upward

            if (message.life <= 0) {
                this.messages.splice(i, 1);
            }
        }
    }

    updateAI() {
        const now = Date.now();
        const aiDelay = 2000 + Math.random() * 3000; // AI acts every 2-5 seconds
        const cardCooldownRemaining = Math.max(0, this.cardCooldownTime - (now - this.lastAiCardPickTime));

        // Check if AI can deploy (both timing and card cooldown)
        if (now - this.lastAiActionTime > aiDelay) {
            if (cardCooldownRemaining === 0) {
                this.performAIAction();
                this.lastAiActionTime = now;
                this.lastAiCardPickTime = now; // Set AI card cooldown
            } else {
                // AI is in card cooldown, show message occasionally
                if (Math.random() < 0.1) { // 10% chance to show message
                    const seconds = Math.ceil(cardCooldownRemaining / 1000);
                    this.showMessage(`🤖 AI waiting ${seconds}s...`, '#FF6B6B');
                }
                this.lastAiActionTime = now; // Reset AI timer to try again later
            }
        }
    }

    performAIAction() {
        // Smart AI: consider player threats and choose appropriate units
        const unitTypeNames = Object.keys(this.unitTypes);
        let selectedUnit = 'knight'; // Default

        // Simple strategy: if player has many units, spawn stronger units
        if (this.units.length > 3) {
            selectedUnit = Math.random() > 0.5 ? 'giant' : 'wizard';
        } else if (this.units.length > 1) {
            selectedUnit = Math.random() > 0.5 ? 'archer' : 'knight';
        } else {
            selectedUnit = unitTypeNames[Math.floor(Math.random() * unitTypeNames.length)];
        }

        const unitType = this.unitTypes[selectedUnit];

        // Spawn in enemy territory (top half)
        const x = 100 + Math.random() * 400;
        const y = 50 + Math.random() * (this.bridgeY - 100);

        const unit = {
            ...unitType,
            x: x,
            y: y,
            maxHealth: unitType.health,
            id: Date.now() + Math.random(),
            side: 'ai',
            target: null,
            lastAttackTime: 0,
            direction: { x: 0, y: 1 } // Move toward player
        };

        this.aiUnits.push(unit);
        this.createParticles(x, y, unitType.color, 8);

        // Show AI action message
        this.showMessage(`AI deployed ${unitType.emoji}!`, '#EF4444');
    }

    findTarget(unit) {
        let nearestDistance = Infinity;
        let nearestTarget = null;

        // Check AI units for player units
        for (const aiUnit of this.aiUnits) {
            if (aiUnit.health <= 0) continue;
            const distance = this.getDistance(unit, aiUnit);
            if (distance < nearestDistance && distance <= unit.range * 1.5) {
                nearestDistance = distance;
                nearestTarget = aiUnit;
            }
        }

        unit.target = nearestTarget;
    }

    findNearestPlayerUnit(aiUnit) {
        let nearestDistance = Infinity;
        let nearestTarget = null;

        for (const unit of this.units) {
            if (unit.health <= 0) continue;
            const distance = this.getDistance(aiUnit, unit);
            if (distance < nearestDistance && distance <= aiUnit.range * 1.5) {
                nearestDistance = distance;
                nearestTarget = unit;
            }
        }

        return nearestTarget;
    }

    moveTowardTarget(unit, target) {
        const dx = target.x - unit.x;
        const dy = target.y - unit.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > unit.range) {
            const moveX = (dx / distance) * unit.speed;
            const moveY = (dy / distance) * unit.speed;

            unit.x += moveX;
            unit.y += moveY;
        }
    }

    tryAttack(attacker, target) {
        const now = Date.now();
        if (now - attacker.lastAttackTime > attacker.attackSpeed) {
            // Ranged attack (archer, wizard)
            if (attacker.range > 50) {
                this.createProjectile(attacker, target);
                // Sound effect substitute - visual feedback
                this.createParticles(attacker.x, attacker.y, attacker.color, 4);
            } else {
                // Melee attack
                target.health -= attacker.damage;
                this.createParticles(target.x, target.y, '#FFD700', 8);
                // Damage flash effect
                this.createParticles(target.x, target.y, '#FF0000', 6);
            }

            attacker.lastAttackTime = now;
        }
    }

    createProjectile(from, to) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const speed = 4;

        this.projectiles.push({
            x: from.x,
            y: from.y,
            dx: (dx / distance) * speed,
            dy: (dy / distance) * speed,
            damage: from.damage,
            life: 100,
            side: from.side,
            color: from.color
        });
    }

    createParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                dx: (Math.random() - 0.5) * 6,
                dy: (Math.random() - 0.5) * 6,
                life: 30,
                color: color
            });
        }
    }

    getDistance(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    findNearestEnemyTower(unit) {
        const enemyTowers = [this.enemyKingTower, this.enemyLeftTower, this.enemyRightTower]
            .filter(tower => tower.health > 0);

        if (enemyTowers.length === 0) return null;

        let nearestTower = enemyTowers[0];
        let nearestDistance = this.getDistance(unit, nearestTower);

        for (const tower of enemyTowers) {
            const distance = this.getDistance(unit, tower);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestTower = tower;
            }
        }

        return nearestTower;
    }

    findNearestPlayerTower(unit) {
        const playerTowers = [this.playerKingTower, this.playerLeftTower, this.playerRightTower]
            .filter(tower => tower.health > 0);

        if (playerTowers.length === 0) return null;

        let nearestTower = playerTowers[0];
        let nearestDistance = this.getDistance(unit, nearestTower);

        for (const tower of playerTowers) {
            const distance = this.getDistance(unit, tower);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestTower = tower;
            }
        }

        return nearestTower;
    }

    checkWinConditions() {
        // Check if King Tower is destroyed (immediate win)
        if (this.playerKingTower.health <= 0) {
            this.enemyScore++;
            this.gameOver('👑 Enemy Destroyed Your King Tower!', '#EF4444');
            return;
        } else if (this.enemyKingTower.health <= 0) {
            this.playerScore++;
            this.gameOver('👑 Victory! King Tower Destroyed!', '#10B981');
            return;
        }

        // Check Princess Tower destruction
        if (this.playerLeftTower.health <= 0 && this.playerRightTower.health <= 0) {
            this.enemyScore++;
            this.gameOver('🏰 Enemy Destroyed Both Princess Towers!', '#EF4444');
            return;
        } else if (this.enemyLeftTower.health <= 0 && this.enemyRightTower.health <= 0) {
            this.playerScore++;
            this.gameOver('🏰 Victory! Both Princess Towers Destroyed!', '#10B981');
            return;
        }

        // Optional: Time-based victory (2 minutes)
        const gameTime = Date.now() - this.gameStartTime;
        if (gameTime > 120000) { // 2 minutes
            if (this.playerTower.health > this.enemyTower.health) {
                this.playerScore++;
                this.gameOver('⏰ Time Up! You Win!', '#10B981');
            } else if (this.enemyTower.health > this.playerTower.health) {
                this.enemyScore++;
                this.gameOver('⏰ Time Up! Enemy Wins!', '#EF4444');
            } else {
                this.gameOver('⏰ Time Up! Draw!', '#FFA500');
            }
        }
    }

    gameOver(message, color = '#FFD700') {
        this.running = false;
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }

        // Clear all units and effects
        this.units = [];
        this.aiUnits = [];
        this.projectiles = [];
        this.selectedCard = null;

        // Clear card selections
        document.querySelectorAll('.card').forEach(card => {
            card.classList.remove('selected');
        });

        // Draw final game state first
        this.draw();

        // Draw game over overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        this.ctx.fillStyle = color;
        this.ctx.font = 'bold 32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3;
        this.ctx.strokeText(message, this.canvasWidth / 2, this.canvasHeight / 2 - 20);
        this.ctx.fillText(message, this.canvasWidth / 2, this.canvasHeight / 2 - 20);

        // Show score
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: You ${this.playerScore} - ${this.enemyScore} Enemy`, this.canvasWidth / 2, this.canvasHeight / 2 + 20);

        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = '18px Arial';
        this.ctx.fillText('Click "Start Battle" to play again', this.canvasWidth / 2, this.canvasHeight / 2 + 60);

        this.ctx.textAlign = 'left';

        this.updateUI();
    }

    draw() {
        // Clear canvas with Clash Royale style background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
        gradient.addColorStop(0, '#1E3A8A');    // Deep blue sky
        gradient.addColorStop(0.2, '#3B82F6');  // Blue sky
        gradient.addColorStop(0.4, '#10B981');  // Green transition
        gradient.addColorStop(0.6, '#059669');  // Dark green grass
        gradient.addColorStop(1, '#064E3B');    // Very dark green
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Draw arena border with gold trim
        this.ctx.strokeStyle = '#F59E0B';
        this.ctx.lineWidth = 6;
        this.ctx.strokeRect(3, 3, this.canvasWidth - 6, this.canvasHeight - 6);

        // Inner border
        this.ctx.strokeStyle = '#92400E';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(5, 5, this.canvasWidth - 10, this.canvasHeight - 10);

        // Draw bridge/river with better Clash Royale style
        this.ctx.fillStyle = '#1E40AF';
        this.ctx.fillRect(0, this.bridgeY - 15, this.canvasWidth, 30);

        // River highlights
        this.ctx.fillStyle = '#3B82F6';
        this.ctx.fillRect(0, this.bridgeY - 12, this.canvasWidth, 6);
        this.ctx.fillRect(0, this.bridgeY + 6, this.canvasWidth, 6);

        // Draw wooden bridge
        this.ctx.fillStyle = '#92400E';
        this.ctx.fillRect(this.canvasWidth/2 - 60, this.bridgeY - 20, 120, 40);

        // Bridge planks
        this.ctx.fillStyle = '#A16207';
        for(let i = 0; i < 6; i++) {
            this.ctx.fillRect(this.canvasWidth/2 - 55 + i*18, this.bridgeY - 18, 15, 36);
        }

        // Draw towers
        // Draw all towers
        this.drawTower(this.playerKingTower, '#4A90E2', '👑');
        this.drawTower(this.playerLeftTower, '#4A90E2', '🏰');
        this.drawTower(this.playerRightTower, '#4A90E2', '🏰');

        this.drawTower(this.enemyKingTower, '#EF4444', '👑');
        this.drawTower(this.enemyLeftTower, '#EF4444', '🏰');
        this.drawTower(this.enemyRightTower, '#EF4444', '🏰');

        // Draw units
        this.units.forEach(unit => this.drawUnit(unit));
        this.aiUnits.forEach(unit => this.drawUnit(unit));

        // Draw projectiles
        this.projectiles.forEach(proj => this.drawProjectile(proj));

        // Draw particles
        this.particles.forEach(particle => this.drawParticle(particle));

        // Draw messages
        this.drawMessages();

        // Draw game timer
        this.drawTimer();
    }

    drawTower(tower, color, emoji) {
        // Tower shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.beginPath();
        this.ctx.arc(tower.x + 4, tower.y + 4, tower.size + 2, 0, Math.PI * 2);
        this.ctx.fill();

        // Tower base (stone)
        this.ctx.fillStyle = '#6B7280';
        this.ctx.beginPath();
        this.ctx.arc(tower.x, tower.y, tower.size + 5, 0, Math.PI * 2);
        this.ctx.fill();

        // Tower main body
        const gradient = this.ctx.createRadialGradient(tower.x, tower.y, 0, tower.x, tower.y, tower.size);
        if (color === '#4A90E2') { // Player towers
            gradient.addColorStop(0, '#60A5FA');
            gradient.addColorStop(0.7, '#3B82F6');
            gradient.addColorStop(1, '#1E40AF');
        } else { // Enemy towers
            gradient.addColorStop(0, '#F87171');
            gradient.addColorStop(0.7, '#EF4444');
            gradient.addColorStop(1, '#DC2626');
        }
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(tower.x, tower.y, tower.size, 0, Math.PI * 2);
        this.ctx.fill();

        // Tower border/rim
        this.ctx.strokeStyle = '#F59E0B';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(tower.x, tower.y, tower.size, 0, Math.PI * 2);
        this.ctx.stroke();

        // Tower emoji
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeText(emoji, tower.x, tower.y + 8);
        this.ctx.fillText(emoji, tower.x, tower.y + 8);

        // Health bar
        const healthPercent = tower.health / tower.maxHealth;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(tower.x - 30, tower.y - tower.size - 15, 60, 8);
        this.ctx.fillStyle = healthPercent > 0.5 ? '#10B981' : healthPercent > 0.25 ? '#F59E0B' : '#EF4444';
        this.ctx.fillRect(tower.x - 28, tower.y - tower.size - 13, 56 * healthPercent, 4);

        this.ctx.textAlign = 'left';
    }

    drawMessages() {
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'center';

        for (let i = 0; i < this.messages.length; i++) {
            const message = this.messages[i];
            const alpha = message.life / 120;

            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = message.color;
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;

            const y = message.y + (i * 25);
            this.ctx.strokeText(message.text, this.canvasWidth / 2, y);
            this.ctx.fillText(message.text, this.canvasWidth / 2, y);

            this.ctx.restore();
        }

        this.ctx.textAlign = 'left';
    }

    drawTimer() {
        if (!this.running) return;

        const gameTime = Date.now() - this.gameStartTime;
        const remainingTime = Math.max(0, 120000 - gameTime); // 2 minutes
        const minutes = Math.floor(remainingTime / 60000);
        const seconds = Math.floor((remainingTime % 60000) / 1000);

        this.ctx.fillStyle = '#FFF';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;

        const timeText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        this.ctx.strokeText(timeText, this.canvasWidth / 2, 30);
        this.ctx.fillText(timeText, this.canvasWidth / 2, 30);

        this.ctx.textAlign = 'left';
    }

    drawUnit(unit) {
        // Unit shadow (larger and more realistic)
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.beginPath();
        this.ctx.arc(unit.x + 3, unit.y + 3, unit.size + 1, 0, Math.PI * 2);
        this.ctx.fill();

        // Unit base/ground circle
        this.ctx.fillStyle = unit.side === 'player' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(unit.x, unit.y + 2, unit.size + 3, 0, Math.PI * 2);
        this.ctx.fill();

        // Unit body with radial gradient
        const gradient = this.ctx.createRadialGradient(unit.x, unit.y, 0, unit.x, unit.y, unit.size);
        const baseColor = unit.side === 'player' ? unit.color : this.adjustColor(unit.color, -40);

        // Create Clash Royale style gradient
        if (unit.side === 'player') {
            gradient.addColorStop(0, this.lightenColor(baseColor, 30));
            gradient.addColorStop(0.7, baseColor);
            gradient.addColorStop(1, this.darkenColor(baseColor, 30));
        } else {
            gradient.addColorStop(0, this.lightenColor(baseColor, 20));
            gradient.addColorStop(0.7, baseColor);
            gradient.addColorStop(1, this.darkenColor(baseColor, 40));
        }

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(unit.x, unit.y, unit.size, 0, Math.PI * 2);
        this.ctx.fill();

        // Unit border with team colors (thicker and more visible)
        this.ctx.strokeStyle = unit.side === 'player' ? '#10B981' : '#EF4444';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Unit emoji
        this.ctx.font = `${unit.size + 8}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#FFF';
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeText(unit.emoji, unit.x, unit.y + 5);
        this.ctx.fillText(unit.emoji, unit.x, unit.y + 5);

        // Health bar
        const healthPercent = unit.health / unit.maxHealth;
        if (healthPercent < 1) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(unit.x - 15, unit.y - unit.size - 10, 30, 4);
            this.ctx.fillStyle = healthPercent > 0.5 ? '#10B981' : healthPercent > 0.25 ? '#F59E0B' : '#EF4444';
            this.ctx.fillRect(unit.x - 14, unit.y - unit.size - 9, 28 * healthPercent, 2);
        }

        this.ctx.textAlign = 'left';
    }

    adjustColor(color, amount) {
        // Simple color adjustment for team differentiation
        const hex = color.replace('#', '');
        const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
        const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
        const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    lightenColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
        const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
        const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    darkenColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) - amount));
        const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) - amount));
        const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) - amount));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    drawProjectile(proj) {
        this.ctx.fillStyle = proj.color;
        this.ctx.beginPath();
        this.ctx.arc(proj.x, proj.y, 3, 0, Math.PI * 2);
        this.ctx.fill();

        // Trail effect
        this.ctx.strokeStyle = proj.color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(proj.x - proj.dx * 3, proj.y - proj.dy * 3);
        this.ctx.lineTo(proj.x, proj.y);
        this.ctx.stroke();
    }

    drawParticle(particle) {
        this.ctx.save();
        this.ctx.globalAlpha = particle.life / 30;
        this.ctx.fillStyle = particle.color;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }

    updateUI() {
        // Update elixir bar
        const elixirFill = document.querySelector('.elixir-fill');
        const elixirCount = document.querySelector('.elixir-count');

        if (elixirFill && elixirCount) {
            const elixirPercent = (this.elixir / this.maxElixir) * 100;
            elixirFill.style.width = `${elixirPercent}%`;
            elixirCount.textContent = this.elixir;
        }

        // Update card availability
        const currentTime = Date.now();
        const cooldownRemaining = Math.max(0, this.cardCooldownTime - (currentTime - this.lastCardPickTime));

        document.querySelectorAll('.card').forEach(card => {
            const cost = parseInt(card.dataset.cost);

            // Check elixir and cooldown
            if (this.elixir < cost || cooldownRemaining > 0) {
                card.classList.add('disabled');

                // Add cooldown display
                if (cooldownRemaining > 0) {
                    const seconds = Math.ceil(cooldownRemaining / 1000);
                    let cooldownElement = card.querySelector('.cooldown-timer');
                    if (!cooldownElement) {
                        cooldownElement = document.createElement('div');
                        cooldownElement.className = 'cooldown-timer';
                        cooldownElement.style.cssText = `
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            background: rgba(255, 0, 0, 0.8);
                            color: white;
                            border-radius: 50%;
                            width: 30px;
                            height: 30px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-weight: bold;
                            font-size: 14px;
                            z-index: 10;
                        `;
                        card.appendChild(cooldownElement);
                    }
                    cooldownElement.textContent = seconds;
                }
            } else {
                card.classList.remove('disabled');
                // Remove cooldown timer if it exists
                const cooldownElement = card.querySelector('.cooldown-timer');
                if (cooldownElement) {
                    cooldownElement.remove();
                }
            }
        });
    }

    showMessage(text, color = '#FFD700') {
        // Add message to array for display
        this.messages.push({
            text: text,
            color: color,
            life: 120, // 2 seconds at 60 FPS
            y: 50
        });

        // Keep only last 3 messages
        if (this.messages.length > 3) {
            this.messages.shift();
        }

        console.log(text);
    }

    toggleFullscreen() {
        const canvas = this.canvas;

        if (!document.fullscreenElement) {
            canvas.requestFullscreen().then(() => {
                // Use setTimeout to ensure fullscreen is fully activated
                setTimeout(() => {
                    // Store original dimensions
                    this.originalWidth = 700;
                    this.originalHeight = 500;

                    // Get actual fullscreen dimensions (prepare for potential use)

                    // Set canvas size to match viewport
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                    canvas.style.width = window.innerWidth + 'px';
                    canvas.style.height = window.innerHeight + 'px';

                    // Update game dimensions
                    this.width = canvas.width;
                    this.height = canvas.height;

                    // Recalculate game elements for new size
                    this.bridgeY = this.height / 2;
                    this.playerTower.x = this.width / 2;
                    this.playerTower.y = this.height - 80;
                    this.enemyTower.x = this.width / 2;
                    this.enemyTower.y = 80;

                    // Force a redraw
                    this.render();

                    this.showMessage('🔳 Fullscreen Mode Active!', '#00FF00');
                    console.log('Entered fullscreen mode:', this.width, 'x', this.height);
                }, 100);
            }).catch(err => {
                this.showMessage('Fullscreen failed!', '#FF6B6B');
                console.log('Fullscreen failed:', err);
            });
        } else {
            document.exitFullscreen().then(() => {
                // Use setTimeout to ensure fullscreen exit is complete
                setTimeout(() => {
                    // Restore original canvas size
                    canvas.width = 700;
                    canvas.height = 500;
                    canvas.style.width = '700px';
                    canvas.style.height = '500px';
                    canvas.style.maxWidth = '100%';

                    // Restore game dimensions
                    this.width = 700;
                    this.height = 500;

                    // Restore original game elements positions
                    this.bridgeY = this.height / 2;
                    this.playerTower.x = this.width / 2;
                    this.playerTower.y = this.height - 60;
                    this.enemyTower.x = this.width / 2;
                    this.enemyTower.y = 60;

                    // Force a redraw
                    this.render();

                    this.showMessage('📱 Normal Mode Restored!', '#FFA500');
                    console.log('Exited fullscreen mode');
                }, 100);
            }).catch(err => {
                console.log('Exit fullscreen failed:', err);
            });
        }
    }

    reset() {
        this.running = false;
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }

        // Initialize canvas and context if not already done
        if (!this.canvas) {
            this.canvas = document.getElementById('clashGame');
        }
        if (!this.ctx && this.canvas) {
            this.ctx = this.canvas.getContext('2d');
        }

        if (!this.ctx) {
            console.error('Unable to get canvas context');
            return;
        }

        // Update tower positions for current canvas size
        this.updateTowerPositions();

        // Clear canvas
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.5, '#228B22');
        gradient.addColorStop(1, '#8B4513');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Draw bridge
        this.ctx.fillStyle = '#4682B4';
        this.ctx.fillRect(0, this.bridgeY - 10, this.canvasWidth, 20);
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(250, this.bridgeY - 15, 100, 30);

        // Reset towers
        // Reset all tower health
        this.playerKingTower.health = this.playerKingTower.maxHealth;
        this.playerLeftTower.health = this.playerLeftTower.maxHealth;
        this.playerRightTower.health = this.playerRightTower.maxHealth;

        this.enemyKingTower.health = this.enemyKingTower.maxHealth;
        this.enemyLeftTower.health = this.enemyLeftTower.maxHealth;
        this.enemyRightTower.health = this.enemyRightTower.maxHealth;
        // Draw all towers
        this.drawTower(this.playerKingTower, '#4A90E2', '👑');
        this.drawTower(this.playerLeftTower, '#4A90E2', '🏰');
        this.drawTower(this.playerRightTower, '#4A90E2', '🏰');

        this.drawTower(this.enemyKingTower, '#EF4444', '👑');
        this.drawTower(this.enemyLeftTower, '#EF4444', '🏰');
        this.drawTower(this.enemyRightTower, '#EF4444', '🏰');

        // Welcome message
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('⚔️ Royal Tower Defense', this.canvasWidth / 2, 150);

        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '18px Arial';
        this.ctx.fillText('Select a card and click to deploy units!', this.canvasWidth / 2, 180);
        this.ctx.fillText('Destroy the enemy tower to win!', this.canvasWidth / 2, 210);

        this.ctx.textAlign = 'left';

        // Reset game state
        this.elixir = 10;
        this.selectedCard = null;
        // Keep scores between games for session tracking
        // this.playerScore = 0;
        // this.enemyScore = 0;
        this.units = [];
        this.aiUnits = [];
        this.projectiles = [];
        this.particles = [];
        this.messages = [];

        // Reset timing
        this.lastElixirTime = Date.now();
        this.lastAiActionTime = Date.now();
        this.gameStartTime = Date.now();

        // Clear card selections
        document.querySelectorAll('.card').forEach(card => {
            card.classList.remove('selected', 'disabled');
        });

        this.updateUI();

        // Welcome message
        this.showMessage('🏆 Royal Arena Ready!', '#FFD700');
    }
}

// Create global instance
const clashGame = new ClashRoyale();

// Global functions for buttons
function startClashRoyale() {
    console.log('Starting Clash Royale...');
    clashGame.start();
}

function resetClashRoyale() {
    console.log('Resetting Clash Royale...');
    clashGame.reset();
}

function toggleClashFullscreen() {
    if (clashGame) {
        clashGame.toggleFullscreen();
    } else {
        console.log('Game not initialized yet');
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing Clash Royale...');

    function initializeGame() {
        const canvas = document.getElementById('clashGame');
        if (canvas) {
            console.log('Canvas found, initializing game...');
            clashGame.reset();
        } else {
            console.log('Canvas not found yet, retrying...');
            setTimeout(initializeGame, 500);
        }
    }

    setTimeout(initializeGame, 300);
});

console.log('Clash Royale game script loaded successfully');