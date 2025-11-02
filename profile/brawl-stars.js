// Brawl Stars Game
class BrawlStars {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.width = 600;
        this.height = 400;
        this.mapWidth = 2400;  // Map is 4x wider - much bigger!
        this.mapHeight = 1800;  // Map is 4.5x taller - much bigger!
        this.running = false;
        this.paused = false;
        this.autoPaused = false;
        this.gameLoop = null;
        this.countdown = 0;
        this.countdownActive = false;
        this.waitingToStart = false;
        this.gameState = 'home'; // 'home', 'brawlers', 'battle', 'countdown', 'playing', 'results'
        this.selectedBrawlerForBattle = 'shelly';
        this.selectedBrawlerIndex = 0;
        this.enemyBrawlers = []; // Will store enemy brawler types for display
        this.animationFrame = 0; // For 3D-like animations
        this.uiAnimations = {
            homeScale: 1,
            brawlerCardAnimations: [],
            countdownPulse: 0
        };

        // Camera system
        this.camera = {
            x: 0,
            y: 0,
            smoothing: 0.08  // Slightly smoother camera for bigger map
        };

        // Player
        this.player = {
            x: this.mapWidth / 2,  // Start in center of map
            y: this.mapHeight / 2,
            size: 25,
            health: 100,
            maxHealth: 100,
            speed: 4,  // Faster movement for bigger map
            ammo: 3,
            maxAmmo: 3,
            reloadTime: 0,
            maxReloadTime: 120, // 2 seconds at 60fps
            brawler: 'mortis',
            superCharge: 0,
            maxSuperCharge: 100,
            invulnerable: 0,
            speedBoost: 0,
            reloadAnimations: [], // Array to store active reload animations
            inGrass: false,
            timeSinceLastDamage: 0, // For auto-healing

            // Animation properties
            animationState: 'idle', // 'idle', 'walking', 'shooting', 'dashing', 'super'
            animationFrame: 0,
            animationTimer: 0,
            facing: 0, // Direction player is facing (radians)
            walkCycle: 0,
            shootingAnimation: 0,
            dashAnimation: 0,
            superAnimation: 0
        };

        // Game objects
        this.enemies = [];
        this.bullets = [];
        this.gems = [];
        this.particles = [];
        this.powerUps = [];
        this.superEffects = [];
        this.damageNumbers = [];
        this.walls = []; // Wall system like real Brawl Stars
        this.grass = []; // Grass patches for invisibility
        this.gemsCollected = 0;
        this.keys = {};

        // Complete Brawler roster with authentic stats
        this.brawlers = {
            shelly: {
                name: 'Shelly',
                health: 120,
                damage: 25,
                range: 150,
                speed: 3,
                reload: 1.5,
                ammo: 3,
                spread: 5,
                super: 'shotgun_blast',
                rarity: 'trophy_road',
                color: '#FFD700',
                description: 'Shelly\'s spread-fire shotgun blasts the other team away!'
            },
            nita: {
                name: 'Nita',
                health: 140,
                damage: 22,
                range: 200,
                speed: 3,
                reload: 1.25,
                ammo: 3,
                spread: 1,
                super: 'bear',
                rarity: 'trophy_road',
                color: '#8B4513',
                description: 'Nita commands nature and her bear protects the team!'
            },
            colt: {
                name: 'Colt',
                health: 100,
                damage: 28,
                range: 300,
                speed: 3,
                reload: 1.75,
                ammo: 6,
                spread: 1,
                super: 'bullet_storm',
                rarity: 'trophy_road',
                color: '#4169E1',
                description: 'Colt fires an accurate burst of bullets!'
            },
            bull: {
                name: 'Bull',
                health: 180,
                damage: 35,
                range: 120,
                speed: 2.5,
                reload: 1.6,
                ammo: 3,
                spread: 5,
                super: 'charge',
                rarity: 'trophy_road',
                color: '#8B0000',
                description: 'Bull charges through walls and enemies!'
            },
            jessie: {
                name: 'Jessie',
                health: 110,
                damage: 26,
                range: 220,
                speed: 3,
                reload: 1.4,
                ammo: 3,
                spread: 1,
                super: 'turret',
                rarity: 'trophy_road',
                color: '#FF69B4',
                description: 'Jessie builds a turret that shoots enemies!'
            },
            brock: {
                name: 'Brock',
                health: 90,
                damage: 45,
                range: 350,
                speed: 3,
                reload: 1.8,
                ammo: 3,
                spread: 1,
                super: 'rocket_rain',
                rarity: 'trophy_road',
                color: '#FF4500',
                description: 'Brock fires explosive rockets from long range!'
            },
            mortis: {
                name: 'Mortis',
                health: 100,
                damage: 35,
                range: 180,
                speed: 4,
                reload: 2.5,
                ammo: 3,
                spread: 1,
                super: 'dash',
                rarity: 'mythic',
                color: '#8A2BE2',
                description: 'Mortis dashes forward with his shovel for a grave encounter!'
            },
            spike: {
                name: 'Spike',
                health: 90,
                damage: 30,
                range: 200,
                speed: 3,
                reload: 1.9,
                ammo: 3,
                spread: 6,
                super: 'spike_field',
                rarity: 'legendary',
                color: '#32CD32',
                description: 'Spike throws cactus grenades that explode into spikes!'
            }
        };

        // Power-ups
        this.powerUpTypes = {
            health: { color: '#ff3366', effect: 'heal', value: 50 },
            speed: { color: '#00aaff', effect: 'speed', value: 120 },
            damage: { color: '#ff6600', effect: 'damage', value: 180 },
            shield: { color: '#aa00ff', effect: 'shield', value: 60 }
        };
    }

    start() {
        console.log('=== STARTING BRAWL STARS ===');
        this.canvas = document.getElementById('brawlGame');
        console.log('Canvas element:', this.canvas);
        console.log('Canvas width:', this.canvas ? this.canvas.width : 'NO CANVAS');
        console.log('Canvas height:', this.canvas ? this.canvas.height : 'NO CANVAS');

        if (!this.canvas) {
            console.error('❌ Canvas element with ID "brawlGame" not found!');
            alert('Canvas not found! Check if the HTML has <canvas id="brawlGame">');
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        console.log('Canvas context:', this.ctx);

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        console.log('✅ Canvas cleared and ready');

        // Reset game state with selected brawler stats
        const selectedBrawler = this.brawlers[this.selectedBrawlerForBattle];

        // Random spawn location with safe area check
        this.setRandomPlayerSpawn();
        this.player.health = selectedBrawler.health;
        this.player.maxHealth = selectedBrawler.health;
        this.player.ammo = selectedBrawler.ammo;
        this.player.maxAmmo = selectedBrawler.ammo;
        this.player.speed = selectedBrawler.speed;
        this.player.brawler = this.selectedBrawlerForBattle;
        this.player.superCharge = 0;
        this.player.invulnerable = 0;
        this.player.speedBoost = 0;
        this.player.reloadTime = 0;
        this.player.reloadAnimations = [];
        this.player.inGrass = false;
        this.player.timeSinceLastDamage = 0;
        this.enemies = [];
        this.bullets = [];
        this.gems = [];
        this.particles = [];
        this.powerUps = [];
        this.superEffects = [];
        this.damageNumbers = [];
        this.walls = [];
        this.grass = [];
        this.gemsCollected = 0;

        // Create initial enemies, gems, power-ups, walls, and grass
        this.spawnWalls();
        this.spawnGrass();
        this.spawnEnemies();
        this.spawnGems();
        this.spawnPowerUps();

        // Event listeners
        this.setupControls();

        // Show home screen
        this.showHomeScreen();
    }

    setRandomPlayerSpawn() {
        console.log('🎯 Setting random player spawn location...');

        // Try to find a safe spawn location (not too close to walls or edges)
        let attempts = 0;
        let safeSpawn = false;

        while (!safeSpawn && attempts < 20) {
            // Random position with some margin from edges
            const margin = 100;
            this.player.x = margin + Math.random() * (this.mapWidth - 2 * margin);
            this.player.y = margin + Math.random() * (this.mapHeight - 2 * margin);

            // Check if spawn location is safe (not in walls)
            safeSpawn = !this.checkWallCollision(this.player.x, this.player.y, this.player.size);
            attempts++;
        }

        // If we couldn't find a safe spawn after 20 attempts, use center as fallback
        if (!safeSpawn) {
            console.log('⚠️ Could not find safe spawn, using center');
            this.player.x = this.mapWidth / 2;
            this.player.y = this.mapHeight / 2;
        }

        console.log(`✅ Player will spawn at (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`);
    }

    showHomeScreen() {
        console.log('🏠 SHOW HOME SCREEN CALLED');
        console.log('Setting gameState to home...');
        this.gameState = 'home';
        this.running = false;
        this.waitingToStart = false;
        this.countdownActive = false;

        console.log('Game state set to:', this.gameState);

        // Start update loop for home screen
        if (this.gameLoop) {
            console.log('Clearing existing game loop...');
            clearInterval(this.gameLoop);
        }
        console.log('Starting new update loop...');
        this.gameLoop = setInterval(() => this.update(), 1000/60);
        console.log('✅ Update loop started for home screen');

        this.updateStartButton();

        // Force an immediate draw to clear the loading screen
        console.log('🎨 Forcing immediate home screen draw...');
        this.draw();
        console.log('✅ Home screen setup complete');
    }

    showBrawlersMenu() {
        this.gameState = 'brawlers';
        console.log('Showing brawlers menu');
    }

    showBattleScreen() {
        this.gameState = 'battle';
        this.player.brawler = this.selectedBrawlerForBattle;
        this.waitingToStart = true; // Allow battle to be started

        // Start update loop for battle screen
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => this.update(), 1000/60);

        this.updateStartButton();
        console.log(`Preparing battle with ${this.selectedBrawlerForBattle}`);
    }

    showStartScreen() {
        this.waitingToStart = true;
        this.running = false;
        this.countdownActive = false;

        // Start update loop for start screen
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => this.update(), 1000/60);

        // Update button text
        this.updateStartButton();

        console.log('Showing start screen - click Start Battle to begin!');
    }

    startBattle() {
        console.log('startBattle() called, waitingToStart:', this.waitingToStart);
        if (!this.waitingToStart) {
            console.log('Not waiting to start, exiting startBattle()');
            return;
        }

        console.log('Starting battle!');
        this.waitingToStart = false;
        this.updateStartButton();
        this.startCountdown();
    }

    updateStartButton() {
        const startBtn = document.getElementById('startBrawlBtn');
        if (startBtn) {
            if (this.gameState === 'battle') {
                startBtn.textContent = '⚔️ START BATTLE';
                startBtn.style.backgroundColor = '#00ff88';
                startBtn.style.animation = 'pulse 2s infinite';
            } else if (this.gameState === 'home') {
                startBtn.textContent = '🎮 START BATTLE';
                startBtn.style.backgroundColor = '#ff3366';
                startBtn.style.animation = 'pulse 2s infinite';
            } else {
                startBtn.textContent = '⭐ Start Brawl';
                startBtn.style.backgroundColor = '';
                startBtn.style.animation = '';
            }
        }
    }

    startCountdown() {
        console.log('Starting countdown...');
        this.countdownActive = true;
        this.countdown = 5;
        this.running = false; // Don't start game logic yet

        // Start countdown timer and drawing
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => this.updateCountdown(), 1000/60);

        // Update countdown every second
        this.countdownInterval = setInterval(() => {
            this.countdown--;
            console.log('Countdown:', this.countdown);

            if (this.countdown <= 0) {
                this.endCountdown();
            }
        }, 1000);
    }

    updateCountdown() {
        this.draw(); // Keep drawing the game scene during countdown
    }

    endCountdown() {
        console.log('Countdown finished - starting game!');

        // Clear countdown interval
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }

        // Start actual game
        this.countdownActive = false;
        this.running = true;
        this.gameState = 'playing'; // Change state to playing
        this.waitingToStart = false; // Make sure this is false

        // Start normal game loop
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => this.update(), 1000/60);

        console.log('Brawl Stars started!');
    }

    setupControls() {
        // Remove old listeners if they exist
        if (this.boundKeyDown) {
            document.removeEventListener('keydown', this.boundKeyDown);
        }
        if (this.boundKeyUp) {
            document.removeEventListener('keyup', this.boundKeyUp);
        }
        if (this.boundShoot && this.canvas) {
            this.canvas.removeEventListener('click', this.boundShoot);
        }
        if (this.boundSuper && this.canvas) {
            this.canvas.removeEventListener('mousedown', this.boundSuper);
        }

        // Add new listeners
        this.boundKeyDown = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePause();
            } else {
                this.keys[e.code] = true;
            }
        };
        this.boundKeyUp = (e) => this.keys[e.code] = false;
        this.boundShoot = (e) => this.handleClick(e);

        document.addEventListener('keydown', this.boundKeyDown);
        document.addEventListener('keyup', this.boundKeyUp);
        this.canvas.addEventListener('click', this.boundShoot);

        // Super ability on right click
        this.boundSuper = (e) => {
            if (e.button === 2) { // Right click
                e.preventDefault();
                this.useSuper();
            }
        };
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        this.canvas.addEventListener('mousedown', this.boundSuper);

        // Add visibility change listeners for auto-pause
        this.boundVisibilityChange = () => this.handleVisibilityChange();
        this.boundBeforeUnload = () => this.handleBeforeUnload();

        document.addEventListener('visibilitychange', this.boundVisibilityChange);
        window.addEventListener('beforeunload', this.boundBeforeUnload);
        window.addEventListener('blur', this.boundVisibilityChange);
        window.addEventListener('focus', this.boundVisibilityChange);
    }

    spawnEnemies() {
        const brawlerKeys = Object.keys(this.brawlers).filter(key => key !== this.selectedBrawlerForBattle);
        this.enemyBrawlers = []; // Reset for new battle

        for (let i = 0; i < 9; i++) { // 9 enemies + 1 player = 10 total like real Brawl Stars
            const brawlerKey = brawlerKeys[Math.floor(Math.random() * brawlerKeys.length)];
            const brawlerData = this.brawlers[brawlerKey];
            this.enemyBrawlers.push(brawlerKey); // Store for countdown display

            const type = this.getBehaviorFromBrawler(brawlerKey);
            let enemy = {
                x: Math.random() * this.mapWidth,
                y: Math.random() * this.mapHeight,
                type: type,
                brawlerType: brawlerKey, // Store the actual brawler type
                shootTimer: 0,
                moveTimer: 0,
                target: null, // For free-for-all AI
                lastTargetSwitch: 0,
                aggressive: Math.random() > 0.3 // 70% chance to be aggressive
            };

            // Type-specific stats - MUCH HARDER
            switch(type) {
                case 'rusher':
                    enemy = {...enemy, size: 20, health: 100, maxHealth: 100, speed: 4, damage: 35, color: '#ff6600', range: 150};
                    break;
                case 'sniper':
                    enemy = {...enemy, size: 18, health: 80, maxHealth: 80, speed: 2, damage: 60, color: '#9900ff', range: 300};
                    break;
                case 'tank':
                    enemy = {...enemy, size: 35, health: 200, maxHealth: 200, speed: 1.5, damage: 45, color: '#666666', range: 120};
                    break;
                case 'assassin':
                    enemy = {...enemy, size: 16, health: 70, maxHealth: 70, speed: 5, damage: 50, color: '#cc00cc', range: 100};
                    break;
                case 'healer':
                    enemy = {...enemy, size: 22, health: 90, maxHealth: 90, speed: 2.5, damage: 25, color: '#00cc88', range: 200, healTimer: 0};
                    break;
            }
            // Override with brawler-specific stats
            enemy.health = brawlerData.health;
            enemy.maxHealth = brawlerData.health;
            enemy.damage = brawlerData.damage;
            enemy.color = brawlerData.color;

            this.enemies.push(enemy);
        }
    }

    getBehaviorFromBrawler(brawlerKey) {
        const behaviorMap = {
            shelly: 'rusher',
            bull: 'tank',
            nita: 'healer',
            colt: 'sniper',
            jessie: 'sniper',
            brock: 'sniper',
            mortis: 'assassin',
            spike: 'rusher'
        };
        return behaviorMap[brawlerKey] || 'rusher';
    }

    spawnGems() {
        for (let i = 0; i < 15; i++) { // Balanced gems for 10-player competitive match
            this.gems.push({
                x: Math.random() * this.mapWidth,
                y: Math.random() * this.mapHeight,
                size: 15,
                bounce: Math.random() * Math.PI * 2,
                collected: false
            });
        }
    }

    spawnPowerUps() {
        const types = Object.keys(this.powerUpTypes);
        for (let i = 0; i < 8; i++) { // Balanced power-ups for competitive 10-player match
            const type = types[Math.floor(Math.random() * types.length)];
            this.powerUps.push({
                x: Math.random() * this.mapWidth,
                y: Math.random() * this.mapHeight,
                type: type,
                size: 20,
                bounce: Math.random() * Math.PI * 2,
                collected: false,
                respawnTimer: 0
            });
        }
    }

    spawnWalls() {
        // Create strategic wall layout like real Brawl Stars maps - all indestructible
        const wallSize = 40;

        // Center maze structure
        const centerX = this.mapWidth / 2;
        const centerY = this.mapHeight / 2;

        // Cross pattern in center
        for (let i = 0; i < 5; i++) {
            // Horizontal walls
            this.walls.push({
                x: centerX - 100 + (i * wallSize),
                y: centerY,
                width: wallSize,
                height: wallSize
            });

            // Vertical walls
            this.walls.push({
                x: centerX,
                y: centerY - 100 + (i * wallSize),
                width: wallSize,
                height: wallSize
            });
        }

        // Corner clusters for strategic positioning
        const corners = [
            {x: 200, y: 200},
            {x: this.mapWidth - 200, y: 200},
            {x: 200, y: this.mapHeight - 200},
            {x: this.mapWidth - 200, y: this.mapHeight - 200}
        ];

        corners.forEach(corner => {
            // L-shaped wall formations in corners
            for (let i = 0; i < 3; i++) {
                this.walls.push({
                    x: corner.x + (i * wallSize),
                    y: corner.y,
                    width: wallSize,
                    height: wallSize
                });

                this.walls.push({
                    x: corner.x,
                    y: corner.y + (i * wallSize),
                    width: wallSize,
                    height: wallSize
                });
            }
        });

        // Random scattered walls for additional cover
        for (let i = 0; i < 15; i++) {
            let x, y;
            let attempts = 0;

            // Try to place walls away from player spawn
            do {
                x = Math.random() * (this.mapWidth - wallSize);
                y = Math.random() * (this.mapHeight - wallSize);
                attempts++;
            } while (this.isNearPlayerSpawn(x, y) && attempts < 20);

            this.walls.push({
                x: x,
                y: y,
                width: wallSize,
                height: wallSize
            });
        }
    }

    spawnGrass() {
        // Create grass patches for invisibility like real Brawl Stars
        const grassPatches = [
            // Large grass areas in strategic locations
            {x: 300, y: 300, width: 120, height: 120},
            {x: this.mapWidth - 420, y: 300, width: 120, height: 120},
            {x: 300, y: this.mapHeight - 420, width: 120, height: 120},
            {x: this.mapWidth - 420, y: this.mapHeight - 420, width: 120, height: 120},

            // Medium grass patches around the map
            {x: this.mapWidth / 2 - 200, y: 150, width: 80, height: 80},
            {x: this.mapWidth / 2 + 120, y: 150, width: 80, height: 80},
            {x: this.mapWidth / 2 - 200, y: this.mapHeight - 230, width: 80, height: 80},
            {x: this.mapWidth / 2 + 120, y: this.mapHeight - 230, width: 80, height: 80},

            // Small scattered grass patches
            {x: 150, y: this.mapHeight / 2, width: 60, height: 60},
            {x: this.mapWidth - 210, y: this.mapHeight / 2, width: 60, height: 60}
        ];

        grassPatches.forEach(patch => {
            // Don't place grass too close to spawn
            if (!this.isNearPlayerSpawn(patch.x + patch.width/2, patch.y + patch.height/2)) {
                this.grass.push(patch);
            }
        });

        // Add some random small grass patches
        for (let i = 0; i < 8; i++) {
            let x, y;
            let attempts = 0;

            do {
                x = Math.random() * (this.mapWidth - 60);
                y = Math.random() * (this.mapHeight - 60);
                attempts++;
            } while (this.isNearPlayerSpawn(x + 30, y + 30) && attempts < 20);

            this.grass.push({
                x: x,
                y: y,
                width: 50 + Math.random() * 30,
                height: 50 + Math.random() * 30
            });
        }
    }

    isNearPlayerSpawn(x, y) {
        const spawnX = this.mapWidth / 2;
        const spawnY = this.mapHeight / 2;
        const distance = Math.sqrt((x - spawnX) ** 2 + (y - spawnY) ** 2);
        return distance < 150; // Keep spawn area clear
    }

    checkWallCollision(x, y, width = 20, height = 20) {
        for (let wall of this.walls) {
            if (x < wall.x + wall.width &&
                x + width > wall.x &&
                y < wall.y + wall.height &&
                y + height > wall.y) {
                return wall;
            }
        }
        return null;
    }

    canMoveTo(x, y, size = 20) {
        // Check map boundaries
        if (x - size/2 < 0 || x + size/2 > this.mapWidth ||
            y - size/2 < 0 || y + size/2 > this.mapHeight) {
            return false;
        }

        // Check wall collisions
        return !this.checkWallCollision(x - size/2, y - size/2, size, size);
    }

    checkGrassCollision(x, y, size = 20) {
        for (let grass of this.grass) {
            if (x - size/2 < grass.x + grass.width &&
                x + size/2 > grass.x &&
                y - size/2 < grass.y + grass.height &&
                y + size/2 > grass.y) {
                return true;
            }
        }
        return false;
    }

    shoot(event) {
        if (!this.running || this.paused || this.countdownActive || this.player.ammo <= 0) return;

        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left + this.camera.x;
        const mouseY = event.clientY - rect.top + this.camera.y;

        const angle = Math.atan2(mouseY - this.player.y, mouseX - this.player.x);
        const brawler = this.brawlers[this.player.brawler];

        // Trigger shooting animation
        this.player.shootingAnimation = 15; // Animation lasts 15 frames (~0.25 seconds)
        this.player.facing = angle; // Face the shooting direction

        // Create bullets based on brawler type
        if (this.player.brawler === 'nani') {
            // Nani - 3 orb projectiles
            for (let i = 0; i < 3; i++) {
                this.bullets.push({
                    x: this.player.x,
                    y: this.player.y,
                    vx: Math.cos(angle) * brawler.bulletSpeed,
                    vy: Math.sin(angle) * brawler.bulletSpeed,
                    damage: brawler.damage,
                    range: brawler.range,
                    traveled: 0,
                    owner: 'player',
                    type: 'nani_orb',
                    delay: i * 5 // Slight delay between orbs
                });
            }
        } else if (this.player.brawler === 'hank') {
            // Hank - Single bubble that bounces
            this.bullets.push({
                x: this.player.x,
                y: this.player.y,
                vx: Math.cos(angle) * brawler.bulletSpeed,
                vy: Math.sin(angle) * brawler.bulletSpeed,
                damage: brawler.damage,
                range: brawler.range,
                traveled: 0,
                owner: 'player',
                type: 'hank_bubble',
                bounces: 2 // Can bounce 2 times
            });
        } else if (this.player.brawler === 'mortis') {
            // Mortis - Dash attack (short range, high damage)
            const dashDistance = 80;
            const targetX = this.player.x + Math.cos(angle) * dashDistance;
            const targetY = this.player.y + Math.sin(angle) * dashDistance;

            // Trigger dash animation
            this.player.dashAnimation = 20; // Dash animation lasts 20 frames (~0.33 seconds)

            // Move player towards target (dash effect)
            this.player.x = Math.max(15, Math.min(this.mapWidth - 15, targetX));
            this.player.y = Math.max(15, Math.min(this.mapHeight - 15, targetY));

            // Create area damage around new position
            this.bullets.push({
                x: this.player.x,
                y: this.player.y,
                vx: 0,
                vy: 0,
                damage: brawler.damage,
                range: 50, // Small area around mortis
                traveled: 0,
                owner: 'player',
                type: 'mortis_dash',
                life: 10 // Short duration
            });
        } else {
            // Default bullet pattern for other brawlers
            for (let i = 0; i < brawler.spread; i++) {
                const spreadAngle = angle + (i - brawler.spread/2 + 0.5) * 0.3;

                this.bullets.push({
                    x: this.player.x,
                    y: this.player.y,
                    vx: Math.cos(spreadAngle) * brawler.bulletSpeed,
                    vy: Math.sin(spreadAngle) * brawler.bulletSpeed,
                    damage: brawler.damage,
                    range: brawler.range,
                    traveled: 0,
                    owner: 'player'
                });
            }
        }

        this.player.ammo--;
        this.createMuzzleFlash(this.player.x, this.player.y, angle);

        // Start reload animation if ammo is being reloaded
        if (this.player.ammo < this.player.maxAmmo) {
            this.createReloadAnimation();
        }

        console.log('Shot fired! Bullets created:', brawler.spread);
    }

    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        console.log(`Click at (${clickX}, ${clickY}) in state: ${this.gameState}`);

        if (this.gameState === 'home') {
            this.handleHomeClick(clickX, clickY);
        } else if (this.gameState === 'brawlers') {
            this.handleBrawlersClick(clickX, clickY);
        } else if (this.gameState === 'battle') {
            this.handleBattleClick(clickX, clickY);
        } else if (this.running && !this.paused && !this.countdownActive) {
            // Normal shooting during gameplay
            this.shoot(event);
        }
    }

    handleHomeClick(x, y) {
        console.log('🎮 Home screen clicked at:', x, y);

        // Check if clicked on "CHANGE BRAWLER" button (bottom of screen)
        const brawlerButtonX = this.width / 2;
        const brawlerButtonY = this.height - 40;
        const buttonWidth = 120; // Approximate text width
        const buttonHeight = 20;

        if (x > brawlerButtonX - buttonWidth/2 && x < brawlerButtonX + buttonWidth/2 &&
            y > brawlerButtonY - buttonHeight/2 && y < brawlerButtonY + buttonHeight/2) {
            console.log('🔄 Change brawler button clicked!');
            this.gameState = 'brawlers';
            return;
        }

        // Otherwise start the game
        console.log('🚀 Starting game!');
        this.startCountdown();
    }

    handleBrawlersClick(x, y) {
        console.log('Handling brawlers click at:', x, y);

        // Brawler card selection
        const brawlerKeys = Object.keys(this.brawlers);
        const cardsPerRow = 4;
        const cardWidth = 120;
        const cardHeight = 160;
        const startX = (this.width - (cardsPerRow * cardWidth + (cardsPerRow - 1) * 20)) / 2;

        brawlerKeys.forEach((key, index) => {
            const row = Math.floor(index / cardsPerRow);
            const col = index % cardsPerRow;
            const cardX = startX + col * (cardWidth + 20);
            const cardY = 80 + row * (cardHeight + 20);

            if (x > cardX && x < cardX + cardWidth &&
                y > cardY && y < cardY + cardHeight) {
                this.selectedBrawlerIndex = index;
                this.selectedBrawlerForBattle = key;
                console.log('Selected brawler:', key);
                // Auto-return to home after selection
                setTimeout(() => {
                    this.gameState = 'home';
                }, 500);
            }
        });

        // Back button
        if (x < 100 && y > this.height - 40) {
            this.gameState = 'home';
        }
    }

    handleBattleClick(x, y) {
        // Battle screen doesn't have clickable elements
        // Clicking anywhere should do nothing
    }

    useSuper() {
        if (!this.running || this.paused || this.countdownActive || this.player.superCharge < this.player.maxSuperCharge) return;

        this.player.superCharge = 0;
        const brawler = this.brawlers[this.player.brawler];

        // Trigger super animation
        this.player.superAnimation = 60; // Super animation lasts 60 frames (~1 second)

        switch(brawler.super) {
            case 'clay_pigeons':
                // Shelly - Wide shotgun blast
                for (let i = 0; i < 5; i++) {
                    const angle = (i - 2) * 0.5;
                    for (let j = 0; j < 3; j++) {
                        this.bullets.push({
                            x: this.player.x,
                            y: this.player.y,
                            vx: Math.cos(angle) * 10,
                            vy: Math.sin(angle) * 10,
                            damage: 40,
                            range: 150,
                            traveled: 0,
                            owner: 'player',
                            super: true
                        });
                    }
                }
                break;

            case 'bullet_train':
                // Colt - Piercing line of bullets
                const angle = Math.atan2(this.keys['mouseY'] - this.player.y, this.keys['mouseX'] - this.player.x);
                for (let i = 0; i < 6; i++) {
                    setTimeout(() => {
                        this.bullets.push({
                            x: this.player.x,
                            y: this.player.y,
                            vx: Math.cos(angle) * 15,
                            vy: Math.sin(angle) * 15,
                            damage: 50,
                            range: 300,
                            traveled: 0,
                            owner: 'player',
                            piercing: true,
                            super: true
                        });
                    }, i * 100);
                }
                break;

            case 'bulldozer':
                // Bull - Charge attack
                this.player.speedBoost = 180; // 3 seconds
                this.player.invulnerable = 60; // 1 second
                break;

            case 'big_barrel':
                // Dynamike - Explosive barrel
                this.superEffects.push({
                    x: this.player.x + 50,
                    y: this.player.y,
                    type: 'barrel',
                    timer: 120, // 2 seconds to explode
                    size: 30
                });
                break;

            case 'peep':
                // Nani - Remote controlled Peep robot
                this.superEffects.push({
                    x: this.player.x + 100,
                    y: this.player.y,
                    type: 'peep',
                    timer: 300, // 5 seconds duration
                    size: 25,
                    vx: 3,
                    vy: 0
                });
                break;

            case 'bubble_wrap':
                // Hank - Multiple bouncing bubbles
                for (let i = 0; i < 5; i++) {
                    const bubbleAngle = (i - 2) * 0.8;
                    this.bullets.push({
                        x: this.player.x,
                        y: this.player.y,
                        vx: Math.cos(bubbleAngle) * 8,
                        vy: Math.sin(bubbleAngle) * 8,
                        damage: 60,
                        range: 200,
                        traveled: 0,
                        owner: 'player',
                        type: 'super_bubble',
                        bounces: 3,
                        super: true
                    });
                }
                break;

            case 'bat_swarm':
                // Mortis - Healing bat swarm
                for (let i = 0; i < 8; i++) {
                    const batAngle = (Math.PI * 2 / 8) * i;
                    this.bullets.push({
                        x: this.player.x,
                        y: this.player.y,
                        vx: Math.cos(batAngle) * 6,
                        vy: Math.sin(batAngle) * 6,
                        damage: 40,
                        range: 120,
                        traveled: 0,
                        owner: 'player',
                        type: 'bat',
                        super: true,
                        healing: true
                    });
                }
                // Heal player
                this.player.health = Math.min(this.player.maxHealth, this.player.health + 50);
                break;
        }

        this.createSuperEffect(this.player.x, this.player.y);
    }

    togglePause() {
        if (!this.running && !this.countdownActive) return;

        this.paused = !this.paused;
        console.log(this.paused ? 'Game paused' : 'Game resumed');
    }

    handleVisibilityChange() {
        if (!this.running) return;

        if (document.hidden || document.visibilityState === 'hidden') {
            // Page is hidden (tab switched, minimized, etc.)
            if (!this.paused) {
                this.paused = true;
                this.autoPaused = true; // Track that this was an auto-pause
                console.log('Game auto-paused (tab hidden)');
            }
        } else {
            // Page is visible again
            if (this.autoPaused && this.paused) {
                this.paused = false;
                this.autoPaused = false;
                console.log('Game auto-resumed (tab visible)');
            }
        }
    }

    handleBeforeUnload() {
        // Pause game before page unloads (refresh, close, navigate away)
        if (this.running && !this.paused) {
            this.paused = true;
            console.log('Game paused (page unloading)');
        }
    }

    update() {
        if (!this.running || this.paused) return;

        this.updatePlayer();
        this.updateCamera();
        this.updateEnemies();
        this.updateBullets();
        this.updateGems();
        this.updatePowerUps();
        this.updateSuperEffects();
        this.updateParticles();
        this.updateDamageNumbers();
        this.updateUI();
        this.draw();

        // Check win condition
        if (this.gemsCollected >= 10) {
            this.win();
        }
    }

    updatePlayer() {
        // Update buffs
        if (this.player.invulnerable > 0) this.player.invulnerable--;
        if (this.player.speedBoost > 0) this.player.speedBoost--;

        // Check if player is in grass
        this.player.inGrass = this.checkGrassCollision(this.player.x, this.player.y, this.player.size);

        // Auto-healing like real Brawl Stars (heal after not taking damage for 3 seconds)
        this.player.timeSinceLastDamage++;
        if (this.player.timeSinceLastDamage >= 180 && this.player.health < this.player.maxHealth) { // 3 seconds at 60fps
            this.player.health = Math.min(this.player.maxHealth, this.player.health + 1); // Heal 1 HP per frame after 3 seconds
        }

        // Movement with speed boost and wall collision
        const speed = this.player.speedBoost > 0 ? this.player.speed * 2 : this.player.speed;

        let newX = this.player.x;
        let newY = this.player.y;

        if (this.keys['KeyW'] || this.keys['ArrowUp']) newY -= speed;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) newY += speed;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) newX -= speed;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) newX += speed;

        // Check if new position is valid (no wall collision)
        if (this.canMoveTo(newX, this.player.y, this.player.size)) {
            this.player.x = newX;
        }
        if (this.canMoveTo(this.player.x, newY, this.player.size)) {
            this.player.y = newY;
        }

        // Update player animations
        this.updatePlayerAnimations(newX, newY);

        // Keep player in map bounds
        this.player.x = Math.max(this.player.size/2, Math.min(this.mapWidth - this.player.size/2, this.player.x));
        this.player.y = Math.max(this.player.size/2, Math.min(this.mapHeight - this.player.size/2, this.player.y));

        // Reload ammo
        if (this.player.ammo < this.player.maxAmmo) {
            this.player.reloadTime++;
            if (this.player.reloadTime >= this.player.maxReloadTime) { // 2 seconds at 60fps
                this.player.ammo++;
                this.player.reloadTime = 0;
                // Create reload complete effect
                this.createReloadCompleteEffect();
            }
        }

        // Update reload animations
        this.updateReloadAnimations();
    }

    updatePlayerAnimations(newX, newY) {
        // Update animation frame counter
        this.player.animationFrame++;
        this.player.animationTimer++;

        // Determine if player is moving
        const isMoving = (newX !== this.player.x || newY !== this.player.y);

        // Calculate facing direction if moving
        if (isMoving) {
            const dx = newX - this.player.x;
            const dy = newY - this.player.y;
            if (dx !== 0 || dy !== 0) {
                this.player.facing = Math.atan2(dy, dx);
            }
        }

        // Update animation timers
        if (this.player.shootingAnimation > 0) {
            this.player.shootingAnimation--;
        }
        if (this.player.dashAnimation > 0) {
            this.player.dashAnimation--;
        }
        if (this.player.superAnimation > 0) {
            this.player.superAnimation--;
        }

        // Determine animation state priority (higher priority overrides lower)
        if (this.player.superAnimation > 0) {
            this.player.animationState = 'super';
        } else if (this.player.dashAnimation > 0) {
            this.player.animationState = 'dashing';
        } else if (this.player.shootingAnimation > 0) {
            this.player.animationState = 'shooting';
        } else if (isMoving) {
            this.player.animationState = 'walking';
            this.player.walkCycle += 0.3;
        } else {
            this.player.animationState = 'idle';
            this.player.walkCycle = 0;
        }
    }

    updateCamera() {
        // Camera follows player smoothly
        const targetX = this.player.x - this.width / 2;
        const targetY = this.player.y - this.height / 2;

        // Smooth camera movement
        this.camera.x += (targetX - this.camera.x) * this.camera.smoothing;
        this.camera.y += (targetY - this.camera.y) * this.camera.smoothing;

        // Keep camera within map bounds
        this.camera.x = Math.max(0, Math.min(this.mapWidth - this.width, this.camera.x));
        this.camera.y = Math.max(0, Math.min(this.mapHeight - this.height, this.camera.y));
    }

    updateEnemies() {
        for (let i = 0; i < this.enemies.length; i++) {
            const enemy = this.enemies[i];
            if (enemy.health <= 0) continue;

            // FREE-FOR-ALL AI: Find target (player or other enemies)
            enemy.lastTargetSwitch++;
            if (!enemy.target || enemy.lastTargetSwitch > 300) { // Switch targets every 5 seconds
                enemy.target = this.findBestTarget(enemy);
                enemy.lastTargetSwitch = 0;
            }

            if (enemy.target) {
                const dx = enemy.target.x - enemy.x;
                const dy = enemy.target.y - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Smart movement based on enemy type
                this.updateEnemyMovement(enemy, dx, dy, dist);

                // Smart shooting based on enemy type
                this.updateEnemyShooting(enemy, dx, dy, dist);
            }

            // Special abilities
            if (enemy.type === 'healer') {
                this.updateHealerAbility(enemy);
            }

            // Keep enemies in bounds
            enemy.x = Math.max(20, Math.min(this.mapWidth - 20, enemy.x));
            enemy.y = Math.max(20, Math.min(this.mapHeight - 20, enemy.y));
        }
    }

    findBestTarget(enemy) {
        let targets = [...this.enemies.filter(e => e !== enemy && e.health > 0)];

        // Only consider the player as a target if they're not invisible in grass
        if (this.player.health > 0 && !this.player.inGrass) {
            targets.push(this.player);
        }

        if (targets.length === 0) return null;

        // Find closest target within range
        let bestTarget = null;
        let closestDist = Infinity;

        for (let target of targets) {
            const dx = target.x - enemy.x;
            const dy = target.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < enemy.range && dist < closestDist) {
                closestDist = dist;
                bestTarget = target;
            }
        }

        // If no target in range, go for closest one
        if (!bestTarget) {
            for (let target of targets) {
                const dx = target.x - enemy.x;
                const dy = target.y - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < closestDist) {
                    closestDist = dist;
                    bestTarget = target;
                }
            }
        }

        return bestTarget;
    }

    updateEnemyMovement(enemy, dx, dy, dist) {
        const moveSpeed = enemy.speed;
        let targetX = enemy.x;
        let targetY = enemy.y;

        switch (enemy.type) {
            case 'rusher':
            case 'assassin':
                // Rush towards target
                if (dist > 40) {
                    targetX += (dx / dist) * moveSpeed;
                    targetY += (dy / dist) * moveSpeed;
                }
                break;

            case 'sniper':
                // Keep distance, kite target
                if (dist < 150) {
                    targetX -= (dx / dist) * moveSpeed;
                    targetY -= (dy / dist) * moveSpeed;
                } else if (dist > 200) {
                    targetX += (dx / dist) * moveSpeed * 0.5;
                    targetY += (dy / dist) * moveSpeed * 0.5;
                }
                break;

            case 'tank':
                // Slow advance
                if (dist > 60) {
                    targetX += (dx / dist) * moveSpeed;
                    targetY += (dy / dist) * moveSpeed;
                }
                break;

            case 'healer':
                // Stay at medium range
                if (dist < 80) {
                    targetX -= (dx / dist) * moveSpeed;
                    targetY -= (dy / dist) * moveSpeed;
                } else if (dist > 120) {
                    targetX += (dx / dist) * moveSpeed;
                    targetY += (dy / dist) * moveSpeed;
                }
                break;
        }

        // Check if movement is blocked by walls
        if (this.canMoveTo(targetX, enemy.y, enemy.size)) {
            enemy.x = targetX;
        } else {
            // Try moving around the wall
            const alternateX = enemy.x + (Math.random() - 0.5) * moveSpeed * 2;
            if (this.canMoveTo(alternateX, enemy.y, enemy.size)) {
                enemy.x = alternateX;
            }
        }

        if (this.canMoveTo(enemy.x, targetY, enemy.size)) {
            enemy.y = targetY;
        } else {
            // Try moving around the wall
            const alternateY = enemy.y + (Math.random() - 0.5) * moveSpeed * 2;
            if (this.canMoveTo(enemy.x, alternateY, enemy.size)) {
                enemy.y = alternateY;
            }
        }
    }

    updateEnemyShooting(enemy, dx, dy, dist) {
        enemy.shootTimer++;

        let shootDelay = 120; // Default 2 seconds
        let bulletSpeed = 8;
        let bulletCount = 1;

        switch (enemy.type) {
            case 'rusher':
                shootDelay = 90; // Faster shooting
                bulletSpeed = 10;
                break;
            case 'sniper':
                shootDelay = 150; // Slower but powerful
                bulletSpeed = 12;
                break;
            case 'tank':
                shootDelay = 180; // Slow but devastating
                bulletSpeed = 6;
                bulletCount = 3; // Spread shot
                break;
            case 'assassin':
                shootDelay = 60; // Very fast
                bulletSpeed = 15;
                break;
            case 'healer':
                shootDelay = 200; // Focus on healing
                bulletSpeed = 7;
                break;
        }

        if (enemy.shootTimer >= shootDelay && dist < enemy.range) {
            const angle = Math.atan2(dy, dx);

            for (let i = 0; i < bulletCount; i++) {
                const spreadAngle = bulletCount > 1 ? angle + (i - 1) * 0.3 : angle;
                this.bullets.push({
                    x: enemy.x,
                    y: enemy.y,
                    vx: Math.cos(spreadAngle) * bulletSpeed,
                    vy: Math.sin(spreadAngle) * bulletSpeed,
                    damage: enemy.damage,
                    range: enemy.range,
                    traveled: 0,
                    owner: 'enemy',
                    size: 4
                });
            }

            enemy.shootTimer = 0;
            this.createMuzzleFlash(enemy.x, enemy.y, angle);
        }
    }

    updateHealerAbility(enemy) {
        enemy.healTimer = (enemy.healTimer || 0) + 1;

        if (enemy.healTimer >= 360) { // Every 6 seconds
            // Find nearby wounded allies
            for (let ally of this.enemies) {
                if (ally === enemy || ally.health <= 0) continue;

                const dx = ally.x - enemy.x;
                const dy = ally.y - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 100 && ally.health < ally.maxHealth) {
                    ally.health = Math.min(ally.maxHealth, ally.health + 30);
                    this.createHitEffect(ally.x, ally.y, '#00ff88');
                    break; // Only heal one ally at a time
                }
            }
            enemy.healTimer = 0;
        }
    }

    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];

            // Handle special bullet types
            if (bullet.type === 'mortis_dash') {
                bullet.life--;
                if (bullet.life <= 0) {
                    this.bullets.splice(i, 1);
                    continue;
                }
            } else if (bullet.type === 'hank_bubble' || bullet.type === 'super_bubble') {
                // Handle bouncing for Hank's bubbles
                if (bullet.x <= 10 || bullet.x >= this.mapWidth - 10) {
                    bullet.vx = -bullet.vx;
                    bullet.bounces--;
                }
                if (bullet.y <= 10 || bullet.y >= this.mapHeight - 10) {
                    bullet.vy = -bullet.vy;
                    bullet.bounces--;
                }
                if (bullet.bounces < 0) {
                    this.bullets.splice(i, 1);
                    continue;
                }
                bullet.x += bullet.vx;
                bullet.y += bullet.vy;
            } else {
                // Normal bullet movement
                bullet.x += bullet.vx;
                bullet.y += bullet.vy;
            }

            bullet.traveled += Math.sqrt(bullet.vx * bullet.vx + bullet.vy * bullet.vy);

            // Check wall collisions - all walls are now indestructible
            const hitWall = this.checkWallCollision(bullet.x - 3, bullet.y - 3, 6, 6);
            if (hitWall) {
                this.bullets.splice(i, 1);
                continue;
            }

            // Remove if out of range or map bounds (except bouncing bullets)
            if (bullet.traveled > bullet.range ||
                (!bullet.bounces && (bullet.x < 0 || bullet.x > this.mapWidth || bullet.y < 0 || bullet.y > this.mapHeight))) {
                this.bullets.splice(i, 1);
                continue;
            }

            // Check collisions
            if (bullet.owner === 'player') {
                // Hit enemies
                for (let j = 0; j < this.enemies.length; j++) {
                    const enemy = this.enemies[j];
                    if (enemy.health > 0 && this.checkCollision(bullet, enemy)) {
                        console.log(`Hit! ${bullet.type} Enemy health: ${enemy.health} -> ${enemy.health - bullet.damage}`);
                        enemy.health -= bullet.damage;
                        this.player.superCharge = Math.min(this.player.maxSuperCharge, this.player.superCharge + 15);
                        this.createHitEffect(bullet.x, bullet.y);
                        this.createDamageNumber(bullet.x, bullet.y, bullet.damage, '#ffaa00');

                        // Remove enemy if dead
                        if (enemy.health <= 0) {
                            console.log('Enemy killed!');
                        }

                        if (!bullet.piercing) {
                            this.bullets.splice(i, 1);
                            break;
                        }
                    }
                }
            } else {
                // Hit player (unless invulnerable or invisible in grass)
                if (this.checkCollision(bullet, this.player) && this.player.invulnerable <= 0 && !this.player.inGrass) {
                    this.player.health -= bullet.damage;
                    this.player.timeSinceLastDamage = 0; // Reset healing timer
                    this.createHitEffect(bullet.x, bullet.y);
                    this.createDamageNumber(bullet.x, bullet.y, bullet.damage, '#ff3366');
                    this.bullets.splice(i, 1);

                    if (this.player.health <= 0) {
                        this.gameOver();
                    }
                }
            }
        }
    }

    updateGems() {
        for (let gem of this.gems) {
            if (gem.collected) continue;

            gem.bounce += 0.1;

            // Check collection
            if (this.checkCollision(gem, this.player)) {
                gem.collected = true;
                this.gemsCollected++;
                this.createGemEffect(gem.x, gem.y);
            }
        }
    }

    updatePowerUps() {
        for (let powerUp of this.powerUps) {
            if (powerUp.collected) {
                powerUp.respawnTimer++;
                if (powerUp.respawnTimer >= 600) { // 10 seconds
                    powerUp.collected = false;
                    powerUp.respawnTimer = 0;
                    powerUp.x = Math.random() * this.mapWidth;
                    powerUp.y = Math.random() * this.mapHeight;
                }
                continue;
            }

            powerUp.bounce += 0.08;

            // Check collection
            if (this.checkCollision(powerUp, this.player)) {
                powerUp.collected = true;
                this.applyPowerUp(powerUp.type);
                this.createPowerUpEffect(powerUp.x, powerUp.y, powerUp.type);
            }
        }
    }

    updateSuperEffects() {
        for (let i = this.superEffects.length - 1; i >= 0; i--) {
            const effect = this.superEffects[i];
            effect.timer--;

            if (effect.type === 'barrel' && effect.timer <= 0) {
                // Dynamike barrel explosion
                for (let enemy of this.enemies) {
                    const dx = enemy.x - effect.x;
                    const dy = enemy.y - effect.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 80) {
                        enemy.health -= 80;
                        this.createExplosionEffect(effect.x, effect.y);
                    }
                }
                this.superEffects.splice(i, 1);
            } else if (effect.type === 'peep') {
                // Nani's Peep robot movement
                effect.x += effect.vx;
                effect.y += effect.vy;

                // Keep Peep in bounds
                if (effect.x <= 20 || effect.x >= this.mapWidth - 20) {
                    effect.vx = -effect.vx;
                }
                if (effect.y <= 20 || effect.y >= this.mapHeight - 20) {
                    effect.vy = -effect.vy;
                }

                // Peep shoots at enemies
                if (effect.timer % 30 === 0) { // Shoot every 0.5 seconds
                    for (let enemy of this.enemies) {
                        if (enemy.health > 0) {
                            const dx = enemy.x - effect.x;
                            const dy = enemy.y - effect.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            if (dist < 150) {
                                const angle = Math.atan2(dy, dx);
                                this.bullets.push({
                                    x: effect.x,
                                    y: effect.y,
                                    vx: Math.cos(angle) * 8,
                                    vy: Math.sin(angle) * 8,
                                    damage: 70,
                                    range: 150,
                                    traveled: 0,
                                    owner: 'player',
                                    type: 'peep_bullet',
                                    super: true
                                });
                                break;
                            }
                        }
                    }
                }

                if (effect.timer <= 0) {
                    this.superEffects.splice(i, 1);
                }
            }
        }
    }

    updateDamageNumbers() {
        for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
            const dmg = this.damageNumbers[i];
            dmg.y -= 2;
            dmg.life--;
            dmg.opacity = dmg.life / 60;

            if (dmg.life <= 0) {
                this.damageNumbers.splice(i, 1);
            }
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

    updateUI() {
        // Update health bar
        const healthFill = document.querySelector('.health-fill');
        const healthText = document.querySelector('.health-text');
        const healthPercent = (this.player.health / this.player.maxHealth) * 100;

        if (healthFill) healthFill.style.width = healthPercent + '%';
        if (healthText) healthText.textContent = Math.max(0, Math.round(healthPercent)) + '%';

        // Update ammo
        const ammoSlots = document.querySelectorAll('.ammo-slot');
        ammoSlots.forEach((slot, index) => {
            slot.classList.toggle('filled', index < this.player.ammo);
        });

        // Update gems
        const gemsCounter = document.querySelector('.gems-counter');
        if (gemsCounter) gemsCounter.textContent = `💎 ${this.gemsCollected}`;

        // Update super bar
        const superFill = document.querySelector('.super-fill');
        const superText = document.querySelector('.super-text');
        const superPercent = (this.player.superCharge / this.player.maxSuperCharge) * 100;

        if (superFill) {
            superFill.style.width = superPercent + '%';
            if (superPercent >= 100) {
                superFill.style.boxShadow = '0 0 20px rgba(255, 170, 0, 0.8)';
            } else {
                superFill.style.boxShadow = 'none';
            }
        }

        if (superText) {
            if (superPercent >= 100) {
                superText.textContent = 'READY!';
                superText.style.color = '#ffaa00';
            } else {
                superText.textContent = 'SUPER';
                superText.style.color = 'white';
            }
        }
    }

    checkCollision(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // For mortis_dash, use the range as the collision radius
        if (obj1.type === 'mortis_dash') {
            return distance < obj1.range;
        }

        // For bullets, use a slightly larger collision radius
        let obj1Size = obj1.size || (obj1.damage ? 6 : obj1.size); // Bullets don't have size, so give them one
        let obj2Size = obj2.size || 20;

        return distance < (obj1Size + obj2Size) / 2;
    }

    createMuzzleFlash(x, y, angle) {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: x + Math.cos(angle) * 20,
                y: y + Math.sin(angle) * 20,
                vx: Math.cos(angle + (Math.random() - 0.5) * 0.5) * 8,
                vy: Math.sin(angle + (Math.random() - 0.5) * 0.5) * 8,
                life: 10,
                color: '#ffaa00',
                size: 3
            });
        }
    }

    createHitEffect(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 20,
                color: '#ff3366',
                size: 4
            });
        }
    }

    createGemEffect(x, y) {
        for (let i = 0; i < 12; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                life: 30,
                color: '#00ff88',
                size: 5
            });
        }
    }

    applyPowerUp(type) {
        const powerUp = this.powerUpTypes[type];

        switch(powerUp.effect) {
            case 'heal':
                this.player.health = Math.min(this.player.maxHealth, this.player.health + powerUp.value);
                break;
            case 'speed':
                this.player.speedBoost = powerUp.value;
                break;
            case 'damage':
                // Damage boost handled in bullet creation
                this.player.damageBoost = powerUp.value;
                break;
            case 'shield':
                this.player.invulnerable = powerUp.value;
                break;
        }
    }

    createPowerUpEffect(x, y, type) {
        const color = this.powerUpTypes[type].color;
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15,
                life: 40,
                color: color,
                size: 6
            });
        }
    }

    createSuperEffect(x, y) {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20,
                life: 50,
                color: '#ffaa00',
                size: 8
            });
        }
    }

    createExplosionEffect(x, y) {
        for (let i = 0; i < 25; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 25,
                vy: (Math.random() - 0.5) * 25,
                life: 60,
                color: '#ff6600',
                size: 10
            });
        }
    }

    createDamageNumber(x, y, damage, color) {
        this.damageNumbers.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y - 10,
            damage: damage,
            color: color,
            life: 60,
            opacity: 1
        });
    }

    createWallHitEffect(x, y) {
        for (let i = 0; i < 6; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 15,
                color: '#8B7355',
                size: 3
            });
        }
    }

    createWallDestroyEffect(x, y) {
        for (let i = 0; i < 12; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15,
                life: 30,
                color: '#D2B48C',
                size: 5
            });
        }
    }

    createReloadAnimation() {
        // Only create one reload animation at a time
        if (this.player.reloadAnimations.length > 0) return;

        this.player.reloadAnimations.push({
            x: this.player.x,
            y: this.player.y - 40, // Above the player
            progress: 0,
            maxProgress: this.player.maxReloadTime,
            life: this.player.maxReloadTime,
            visible: true,
            startTime: Date.now(),
            pulseAnimation: 0,
            // Individual ammo slot properties
            slots: [
                { filled: this.player.ammo >= 1, reloading: this.player.ammo < 1, progress: this.player.ammo >= 1 ? 1 : 0 },
                { filled: this.player.ammo >= 2, reloading: this.player.ammo < 2 && this.player.ammo >= 1, progress: this.player.ammo >= 2 ? 1 : 0 },
                { filled: this.player.ammo >= 3, reloading: this.player.ammo < 3 && this.player.ammo >= 2, progress: this.player.ammo >= 3 ? 1 : 0 }
            ]
        });

        // Create reload start effect
        this.createReloadStartEffect();
    }

    createReloadStartEffect() {
        // Create blue particles when reload starts
        for (let i = 0; i < 6; i++) {
            this.particles.push({
                x: this.player.x,
                y: this.player.y - 35,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 15,
                color: '#00aaff',
                size: 2
            });
        }
    }

    createReloadCompleteEffect() {
        // Create bright green sparkle effect when reload completes
        for (let i = 0; i < 12; i++) {
            this.particles.push({
                x: this.player.x,
                y: this.player.y - 30,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 25,
                color: '#00ff88',
                size: 4
            });
        }

        // Add bright flash effect
        for (let i = 0; i < 6; i++) {
            this.particles.push({
                x: this.player.x,
                y: this.player.y - 30,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 15,
                color: '#ffff00',
                size: 6
            });
        }
    }

    updateReloadAnimations() {
        for (let i = this.player.reloadAnimations.length - 1; i >= 0; i--) {
            const reload = this.player.reloadAnimations[i];

            // Update position to follow player
            reload.x = this.player.x;
            reload.y = this.player.y - 40;

            // Update progress based on player's reload time
            reload.progress = this.player.reloadTime;
            reload.life--;

            // Update pulse animation
            reload.pulseAnimation += 0.2;

            // Update individual slot states
            for (let slotIndex = 0; slotIndex < 3; slotIndex++) {
                const slot = reload.slots[slotIndex];
                const ammoNeeded = slotIndex + 1;

                slot.filled = this.player.ammo >= ammoNeeded;

                // Determine which slot is currently reloading
                const emptySlots = 3 - this.player.ammo;
                const currentReloadingSlot = this.player.ammo; // The next slot to be filled

                if (slotIndex === currentReloadingSlot && this.player.ammo < 3) {
                    slot.reloading = true;
                    slot.progress = this.player.reloadTime / this.player.maxReloadTime;
                } else {
                    slot.reloading = false;
                    slot.progress = slot.filled ? 1 : 0;
                }
            }

            // Remove if completed or player has full ammo
            if (reload.life <= 0 || this.player.ammo >= this.player.maxAmmo) {
                this.player.reloadAnimations.splice(i, 1);
            }
        }
    }

    drawReloadAnimations() {
        for (let reload of this.player.reloadAnimations) {
            if (!reload.visible) continue;

            const pulseScale = 1 + Math.sin(reload.pulseAnimation) * 0.05; // Gentle pulsing effect

            // Apply pulsing scale
            this.ctx.save();
            this.ctx.translate(reload.x, reload.y);
            this.ctx.scale(pulseScale, pulseScale);
            this.ctx.translate(-reload.x, -reload.y);

            // Draw 3 individual ammo rectangles
            const slotWidth = 12;
            const slotHeight = 20;
            const slotSpacing = 4;
            const totalWidth = (slotWidth * 3) + (slotSpacing * 2);
            const startX = reload.x - totalWidth / 2;

            // Draw title text
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 8px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.shadowBlur = 2;
            this.ctx.shadowColor = '#000000';
            this.ctx.fillText('RELOAD', reload.x, reload.y - 15);
            this.ctx.shadowBlur = 0;

            // Draw each ammo slot
            for (let i = 0; i < 3; i++) {
                const slot = reload.slots[i];
                const slotX = startX + (i * (slotWidth + slotSpacing));
                const slotY = reload.y - slotHeight / 2;

                // Draw slot background
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                this.ctx.fillRect(slotX, slotY, slotWidth, slotHeight);

                // Draw slot border
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(slotX, slotY, slotWidth, slotHeight);

                if (slot.filled) {
                    // Draw filled slot (bright green)
                    this.ctx.fillStyle = '#00ff88';
                    this.ctx.shadowBlur = 8;
                    this.ctx.shadowColor = '#00ff88';
                    this.ctx.fillRect(slotX + 1, slotY + 1, slotWidth - 2, slotHeight - 2);
                    this.ctx.shadowBlur = 0;
                } else if (slot.reloading) {
                    // Draw reloading slot with progress
                    const fillHeight = (slotHeight - 2) * slot.progress;
                    const fillY = slotY + slotHeight - 1 - fillHeight;

                    // Create gradient for reloading
                    const gradient = this.ctx.createLinearGradient(
                        slotX, fillY,
                        slotX, fillY + fillHeight
                    );
                    gradient.addColorStop(0, '#ffaa00');
                    gradient.addColorStop(1, '#ff6600');

                    this.ctx.fillStyle = gradient;
                    this.ctx.shadowBlur = 10;
                    this.ctx.shadowColor = '#ffaa00';
                    this.ctx.fillRect(slotX + 1, fillY, slotWidth - 2, fillHeight);
                    this.ctx.shadowBlur = 0;

                    // Add sparkle effect at the top of progress
                    if (slot.progress > 0.1) {
                        this.ctx.fillStyle = '#ffffff';
                        this.ctx.shadowBlur = 5;
                        this.ctx.shadowColor = '#ffffff';
                        this.ctx.beginPath();
                        this.ctx.arc(slotX + slotWidth/2, fillY, 1, 0, Math.PI * 2);
                        this.ctx.fill();
                        this.ctx.shadowBlur = 0;
                    }
                } else {
                    // Draw empty slot (dark)
                    this.ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
                    this.ctx.fillRect(slotX + 1, slotY + 1, slotWidth - 2, slotHeight - 2);
                }

                // Add slot number
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = 'bold 6px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText((i + 1).toString(), slotX + slotWidth/2, slotY + slotHeight + 8);
            }

            this.ctx.textAlign = 'left';
            this.ctx.restore();
        }
    }

    update() {
        this.animationFrame++;
        this.uiAnimations.homeScale = 1 + Math.sin(this.animationFrame * 0.02) * 0.05;
        this.uiAnimations.countdownPulse = Math.sin(this.animationFrame * 0.1) * 0.3;

        // Update countdown
        if (this.countdownActive) {
            this.countdown--;
            if (this.countdown <= 0) {
                this.countdownActive = false;
                this.gameState = 'playing';
            }
        }

        if (this.gameState === 'playing') {
            this.updateGame();
        }

        this.draw(); // Always draw after updating
    }

    updateGame() {
        console.log('🎮 updateGame() called - running main game logic');
        if (!this.running || this.paused) {
            console.log('Game not running or paused, skipping update');
            return;
        }

        this.updatePlayer();
        this.updateCamera();
        this.updateEnemies();
        this.updateBullets();
        this.updateGems();
        this.updatePowerUps();
        this.updateSuperEffects();
        this.updateParticles();
        this.updateDamageNumbers();
        this.updateUI();

        // Check win condition
        if (this.gemsCollected >= 10) {
            this.win();
        }
    }

    draw() {
        console.log('Drawing, gameState:', this.gameState);

        // Clear the canvas with authentic Brawl Stars colors
        this.ctx.fillStyle = '#87CEEB'; // Sky blue background
        this.ctx.fillRect(0, 0, this.width, this.height);

        switch (this.gameState) {
            case 'home':
                this.drawHomeScreen();
                break;
            case 'brawlers':
                this.drawBrawlerSelection();
                break;
            case 'countdown':
                this.drawCountdownScreen();
                break;
            case 'playing':
                this.drawGameplay();
                break;
            case 'results':
                this.drawResultsScreen();
                break;
        }
    }

    drawHomeScreen() {
        // Brawl Stars logo area
        this.ctx.save();
        this.ctx.translate(this.width / 2, 80);
        this.ctx.scale(this.uiAnimations.homeScale, this.uiAnimations.homeScale);

        // Main logo background
        const gradient = this.ctx.createLinearGradient(-150, -30, 150, 30);
        gradient.addColorStop(0, '#FF6B35');
        gradient.addColorStop(0.5, '#F7931E');
        gradient.addColorStop(1, '#FFD700');

        this.ctx.fillStyle = gradient;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#FF6B35';
        this.ctx.fillRect(-150, -30, 300, 60);

        // Logo text
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.shadowBlur = 5;
        this.ctx.shadowColor = '#000000';
        this.ctx.fillText('BRAWL STARS', 0, 10);

        this.ctx.restore();

        // Animated 3D-style brawler showcase
        this.drawMainMenuBrawler();

        // Play button
        this.drawPlayButton();

        // Brawler selection button
        this.drawBrawlerButton();
    }

    drawMainMenuBrawler() {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const brawler = this.brawlers[this.selectedBrawlerForBattle];

        // 3D-style platform
        this.ctx.save();
        this.ctx.translate(centerX, centerY + 50);

        // Platform shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 40, 80, 20, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Brawler representation (animated)
        const bounceOffset = Math.sin(this.animationFrame * 0.08) * 10;
        this.ctx.translate(0, bounceOffset);

        // Brawler glow
        this.ctx.shadowBlur = 25;
        this.ctx.shadowColor = brawler.color;

        // Brawler body (3D-like cylinder)
        const gradient = this.ctx.createLinearGradient(-25, -40, 25, 40);
        gradient.addColorStop(0, brawler.color);
        gradient.addColorStop(0.5, this.lightenColor(brawler.color, 20));
        gradient.addColorStop(1, this.darkenColor(brawler.color, 20));

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(-25, -40, 50, 80);

        // Brawler highlight
        this.ctx.fillStyle = this.lightenColor(brawler.color, 40);
        this.ctx.fillRect(-20, -35, 15, 70);

        this.ctx.restore();

        // Brawler name and info
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.shadowBlur = 3;
        this.ctx.shadowColor = '#000000';
        this.ctx.fillText(brawler.name.toUpperCase(), centerX, centerY + 120);

        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = this.getRarityColor(brawler.rarity);
        this.ctx.fillText(brawler.rarity.toUpperCase().replace('_', ' '), centerX, centerY + 140);
    }

    drawPlayButton() {
        const buttonX = this.width / 2;
        const buttonY = this.height - 100;
        const buttonWidth = 200;
        const buttonHeight = 50;

        // Button background
        const gradient = this.ctx.createLinearGradient(
            buttonX - buttonWidth/2, buttonY - buttonHeight/2,
            buttonX + buttonWidth/2, buttonY + buttonHeight/2
        );
        gradient.addColorStop(0, '#4CAF50');
        gradient.addColorStop(1, '#45a049');

        this.ctx.fillStyle = gradient;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#4CAF50';
        this.ctx.fillRect(buttonX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight);

        // Button text
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.shadowBlur = 3;
        this.ctx.shadowColor = '#000000';
        this.ctx.fillText('PLAY', buttonX, buttonY + 7);

        this.ctx.shadowBlur = 0;
    }

    drawPlayButton() {
        // Play button coordinates (match the click detection)
        const buttonX = 300; // Center between 200-400
        const buttonY = 375; // Center between 350-400
        const buttonWidth = 180;
        const buttonHeight = 40;

        // Button background with glow effect
        this.ctx.save();
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#FF6B35';

        // Button gradient
        const gradient = this.ctx.createLinearGradient(buttonX - buttonWidth/2, buttonY - buttonHeight/2,
                                                      buttonX + buttonWidth/2, buttonY + buttonHeight/2);
        gradient.addColorStop(0, '#FF6B35');
        gradient.addColorStop(0.5, '#F7931E');
        gradient.addColorStop(1, '#FFD700');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(buttonX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight);

        // Button border
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(buttonX - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight);

        // Button text
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.shadowBlur = 3;
        this.ctx.shadowColor = '#000000';
        this.ctx.fillText('⚔️ START BATTLE', buttonX, buttonY + 7);

        this.ctx.restore();
    }

    drawAnimatedPlayer() {
        const selectedBrawler = this.brawlers[this.selectedBrawlerForBattle];

        // Set opacity for grass invisibility
        let playerOpacity = 1;
        if (this.player.inGrass) {
            playerOpacity = 0.3; // Semi-transparent when in grass
        }
        this.ctx.globalAlpha = playerOpacity;

        // Save context for transformations
        this.ctx.save();
        this.ctx.translate(this.player.x, this.player.y);

        // Rotate player to face movement direction if moving
        if (this.player.animationState === 'walking' || this.player.animationState === 'shooting') {
            this.ctx.rotate(this.player.facing);
        }

        // Set base color and effects
        let playerColor = this.player.invulnerable > 0 ? '#ffff00' : selectedBrawler.color;

        // Shadow effects
        if (this.player.speedBoost > 0) {
            this.ctx.shadowBlur = 25;
            this.ctx.shadowColor = '#00ffff';
        } else if (this.player.inGrass) {
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#32CD32';
        } else {
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = selectedBrawler.color;
        }

        // Don't draw if invulnerable and flashing
        if (this.player.invulnerable > 0 && Math.floor(this.player.invulnerable / 5) % 2 === 0) {
            this.ctx.restore();
            this.ctx.globalAlpha = 1;
            return;
        }

        // Draw different animations based on brawler and state
        switch (selectedBrawler.name.toLowerCase()) {
            case 'mortis':
                this.drawMortisAnimation(playerColor);
                break;
            case 'shelly':
                this.drawShellyAnimation(playerColor);
                break;
            case 'colt':
                this.drawColtAnimation(playerColor);
                break;
            default:
                this.drawGenericBrawlerAnimation(playerColor);
                break;
        }

        this.ctx.restore();

        // Draw brawler name above player (outside of rotation)
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.shadowBlur = 3;
        this.ctx.shadowColor = '#000000';
        this.ctx.fillText(selectedBrawler.name.toUpperCase(), this.player.x, this.player.y - 30);

        // Reset effects
        this.ctx.globalAlpha = 1;
        this.ctx.shadowBlur = 0;
    }

    drawMortisAnimation(color) {
        const state = this.player.animationState;
        const frame = this.player.animationFrame;
        const size = this.player.size;

        switch (state) {
            case 'idle':
                // Mortis idle - floating cape animation
                const floatOffset = Math.sin(frame * 0.1) * 2;

                // Body
                this.ctx.fillStyle = color;
                this.ctx.fillRect(-size/3, -size/2 + floatOffset, size/1.5, size);

                // Cape (animated)
                this.ctx.fillStyle = '#4B0082'; // Dark purple cape
                const capeWave = Math.sin(frame * 0.15) * 3;
                this.ctx.fillRect(-size/2, -size/2 + floatOffset, size/4, size + capeWave);

                // Hat
                this.ctx.fillStyle = '#2F2F2F';
                this.ctx.fillRect(-size/2, -size/2 + floatOffset, size, size/3);
                break;

            case 'walking':
                // Mortis walk - bouncing motion
                const walkBounce = Math.abs(Math.sin(frame * 0.3)) * 4;

                // Body
                this.ctx.fillStyle = color;
                this.ctx.fillRect(-size/3, -size/2 - walkBounce, size/1.5, size);

                // Cape flowing
                this.ctx.fillStyle = '#4B0082';
                const capeFlow = Math.sin(frame * 0.2) * 5;
                this.ctx.fillRect(-size/2 - capeFlow, -size/2 - walkBounce, size/4, size + 5);

                // Hat
                this.ctx.fillStyle = '#2F2F2F';
                this.ctx.fillRect(-size/2, -size/2 - walkBounce, size, size/3);
                break;

            case 'dashing':
                // Mortis dash - elongated with motion lines
                this.ctx.fillStyle = color;
                this.ctx.fillRect(-size/2, -size/3, size * 1.5, size/1.5);

                // Motion lines
                this.ctx.strokeStyle = '#9932CC';
                this.ctx.lineWidth = 3;
                for (let i = 0; i < 3; i++) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(-size - i * 8, -5 + i * 5);
                    this.ctx.lineTo(-size/2 - i * 8, 5 + i * 5);
                    this.ctx.stroke();
                }
                break;

            case 'shooting':
                // Mortis attack - shovel swing
                const swingAngle = Math.sin(this.player.shootingAnimation * 0.5) * 0.5;

                // Body
                this.ctx.fillStyle = color;
                this.ctx.fillRect(-size/3, -size/2, size/1.5, size);

                // Shovel (animated swing)
                this.ctx.save();
                this.ctx.rotate(swingAngle);
                this.ctx.fillStyle = '#8B4513';
                this.ctx.fillRect(size/2, -size/4, size/2, size/8);
                this.ctx.restore();
                break;

            case 'super':
                // Mortis super - bats flying
                this.ctx.fillStyle = color;
                this.ctx.fillRect(-size/3, -size/2, size/1.5, size);

                // Flying bats
                for (let i = 0; i < 3; i++) {
                    const batAngle = (frame * 0.2 + i * 2) % (Math.PI * 2);
                    const batX = Math.cos(batAngle) * (size + 10);
                    const batY = Math.sin(batAngle) * (size + 10);

                    this.ctx.fillStyle = '#2F2F2F';
                    this.ctx.save();
                    this.ctx.translate(batX, batY);
                    this.ctx.fillRect(-3, -2, 6, 4);
                    this.ctx.restore();
                }
                break;
        }
    }

    drawShellyAnimation(color) {
        const state = this.player.animationState;
        const frame = this.player.animationFrame;
        const size = this.player.size;

        switch (state) {
            case 'idle':
                // Shelly idle - slight breathing animation
                const breathe = Math.sin(frame * 0.08) * 1;

                // Body
                this.ctx.fillStyle = color;
                this.ctx.fillRect(-size/2, -size/2 + breathe, size, size);

                // Shotgun
                this.ctx.fillStyle = '#4A4A4A';
                this.ctx.fillRect(size/3, -size/4 + breathe, size/2, size/6);
                break;

            case 'walking':
                // Shelly walk - step animation
                const stepHeight = Math.abs(Math.sin(frame * 0.25)) * 3;

                // Body
                this.ctx.fillStyle = color;
                this.ctx.fillRect(-size/2, -size/2 - stepHeight, size, size);

                // Shotgun
                this.ctx.fillStyle = '#4A4A4A';
                this.ctx.fillRect(size/3, -size/4 - stepHeight, size/2, size/6);
                break;

            case 'shooting':
                // Shelly shooting - recoil animation
                const recoil = Math.max(0, 10 - this.player.shootingAnimation);

                // Body (pushed back by recoil)
                this.ctx.fillStyle = color;
                this.ctx.fillRect(-size/2 - recoil, -size/2, size, size);

                // Shotgun with muzzle flash
                this.ctx.fillStyle = '#4A4A4A';
                this.ctx.fillRect(size/3 - recoil, -size/4, size/2, size/6);

                // Muzzle flash
                if (this.player.shootingAnimation < 5) {
                    this.ctx.fillStyle = '#FFD700';
                    this.ctx.fillRect(size, -size/6, size/3, size/3);
                }
                break;
        }
    }

    drawColtAnimation(color) {
        const state = this.player.animationState;
        const frame = this.player.animationFrame;
        const size = this.player.size;

        switch (state) {
            case 'idle':
                // Colt idle - cowboy stance
                this.ctx.fillStyle = color;
                this.ctx.fillRect(-size/2, -size/2, size, size);

                // Twin pistols
                this.ctx.fillStyle = '#2F2F2F';
                this.ctx.fillRect(size/3, -size/3, size/4, size/8);
                this.ctx.fillRect(size/3, size/6, size/4, size/8);
                break;

            case 'walking':
                // Colt walk - confident stride
                const strideHeight = Math.abs(Math.sin(frame * 0.3)) * 2;

                this.ctx.fillStyle = color;
                this.ctx.fillRect(-size/2, -size/2 - strideHeight, size, size);

                // Pistols
                this.ctx.fillStyle = '#2F2F2F';
                this.ctx.fillRect(size/3, -size/3 - strideHeight, size/4, size/8);
                this.ctx.fillRect(size/3, size/6 - strideHeight, size/4, size/8);
                break;

            case 'shooting':
                // Colt shooting - rapid fire stance
                const rapidFire = this.player.shootingAnimation % 4;

                this.ctx.fillStyle = color;
                this.ctx.fillRect(-size/2, -size/2, size, size);

                // Alternating pistol flashes
                this.ctx.fillStyle = '#2F2F2F';
                this.ctx.fillRect(size/3, -size/3, size/4, size/8);
                this.ctx.fillRect(size/3, size/6, size/4, size/8);

                // Muzzle flash on alternating pistols
                if (rapidFire < 2) {
                    this.ctx.fillStyle = '#FFD700';
                    this.ctx.fillRect(size * 0.6, -size/4, size/4, size/6);
                } else {
                    this.ctx.fillStyle = '#FFD700';
                    this.ctx.fillRect(size * 0.6, size/12, size/4, size/6);
                }
                break;
        }
    }

    drawGenericBrawlerAnimation(color) {
        const state = this.player.animationState;
        const frame = this.player.animationFrame;
        const size = this.player.size;

        switch (state) {
            case 'idle':
                // Generic idle
                const idle = Math.sin(frame * 0.1) * 1;
                this.ctx.fillStyle = color;
                this.ctx.fillRect(-size/2, -size/2 + idle, size, size);
                break;

            case 'walking':
                // Generic walk
                const walk = Math.abs(Math.sin(frame * 0.3)) * 3;
                this.ctx.fillStyle = color;
                this.ctx.fillRect(-size/2, -size/2 - walk, size, size);
                break;

            case 'shooting':
                // Generic shooting
                this.ctx.fillStyle = color;
                this.ctx.fillRect(-size/2, -size/2, size, size);

                // Generic weapon effect
                if (this.player.shootingAnimation < 8) {
                    this.ctx.fillStyle = '#FFD700';
                    this.ctx.fillRect(size/3, -size/6, size/3, size/3);
                }
                break;

            default:
                this.ctx.fillStyle = color;
                this.ctx.fillRect(-size/2, -size/2, size, size);
                break;
        }
    }

    drawBrawlerButton() {
        const buttonX = this.width / 2;
        const buttonY = this.height - 40;

        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.shadowBlur = 2;
        this.ctx.shadowColor = '#000000';
        this.ctx.fillText('CHANGE BRAWLER', buttonX, buttonY);

        this.ctx.shadowBlur = 0;
    }

    lightenColor(color, percent) {
        const num = parseInt(color.replace("#",""),16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
    }

    darkenColor(color, percent) {
        const num = parseInt(color.replace("#",""),16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R>255?255:R<0?0:R)*0x10000 + (G>255?255:G<0?0:G)*0x100 + (B>255?255:B<0?0:B)).toString(16).slice(1);
    }

    getRarityColor(rarity) {
        const colors = {
            'trophy_road': '#29ABE2',
            'rare': '#4CAF50',
            'super_rare': '#2196F3',
            'epic': '#9C27B0',
            'mythic': '#E91E63',
            'legendary': '#FF9800'
        };
        return colors[rarity] || '#FFFFFF';
    }

    drawBrawlerSelection() {
        // Background
        this.ctx.fillStyle = '#1E3A8A';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Title
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.shadowBlur = 5;
        this.ctx.shadowColor = '#000000';
        this.ctx.fillText('SELECT BRAWLER', this.width / 2, 50);

        // Brawler cards
        const brawlerKeys = Object.keys(this.brawlers);
        const cardsPerRow = 4;
        const cardWidth = 120;
        const cardHeight = 160;
        const startX = (this.width - (cardsPerRow * cardWidth + (cardsPerRow - 1) * 20)) / 2;

        brawlerKeys.forEach((key, index) => {
            const row = Math.floor(index / cardsPerRow);
            const col = index % cardsPerRow;
            const x = startX + col * (cardWidth + 20);
            const y = 80 + row * (cardHeight + 20);

            this.drawBrawlerCard(key, x, y, cardWidth, cardHeight, index === this.selectedBrawlerIndex);
        });

        // Back button
        this.ctx.fillStyle = '#FF6B35';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText('BACK', 50, this.height - 20);

        this.ctx.shadowBlur = 0;
    }

    drawBrawlerCard(brawlerKey, x, y, width, height, selected) {
        const brawler = this.brawlers[brawlerKey];

        // Card background
        this.ctx.fillStyle = selected ? '#FFD700' : '#2D5BA5';
        this.ctx.strokeStyle = selected ? '#FF6B35' : '#1E3A8A';
        this.ctx.lineWidth = selected ? 4 : 2;

        this.ctx.fillRect(x, y, width, height);
        this.ctx.strokeRect(x, y, width, height);

        // Brawler representation
        const centerX = x + width / 2;
        const centerY = y + height / 2 - 20;

        this.ctx.fillStyle = brawler.color;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = brawler.color;
        this.ctx.fillRect(centerX - 25, centerY - 30, 50, 60);

        // Brawler name
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.shadowBlur = 2;
        this.ctx.shadowColor = '#000000';
        this.ctx.fillText(brawler.name.toUpperCase(), centerX, y + height - 30);

        // Rarity
        this.ctx.fillStyle = this.getRarityColor(brawler.rarity);
        this.ctx.font = '10px Arial';
        this.ctx.fillText(brawler.rarity.toUpperCase().replace('_', ' '), centerX, y + height - 15);

        this.ctx.shadowBlur = 0;
    }

    drawCountdownScreen() {
        // Background with authentic colors
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#1E3A8A');
        gradient.addColorStop(1, '#3B82F6');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Battle header
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.shadowBlur = 5;
        this.ctx.shadowColor = '#000000';
        this.ctx.fillText('SHOWDOWN', this.width / 2, 50);

        // Player brawler (left side)
        this.drawCountdownBrawler(this.selectedBrawlerForBattle, 150, this.height / 2, true);

        // VS text
        this.ctx.save();
        this.ctx.translate(this.width / 2, this.height / 2);
        this.ctx.scale(1 + this.uiAnimations.countdownPulse, 1 + this.uiAnimations.countdownPulse);

        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#FF6B35';
        this.ctx.fillText('VS', 0, 0);

        this.ctx.restore();

        // Enemy brawlers preview (right side)
        const centerY = this.height / 2;
        const enemyDisplayCount = Math.min(3, this.enemyBrawlers.length);

        for (let i = 0; i < enemyDisplayCount; i++) {
            const y = centerY - 60 + (i * 40);
            this.drawCountdownBrawler(this.enemyBrawlers[i], 450, y, false, true);
        }

        if (this.enemyBrawlers.length > 3) {
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`+${this.enemyBrawlers.length - 3} more`, 450, centerY + 80);
        }

        // Countdown number
        if (this.countdownActive && this.countdown > 0) {
            this.ctx.save();
            this.ctx.translate(this.width / 2, this.height - 100);
            this.ctx.scale(2 + this.uiAnimations.countdownPulse, 2 + this.uiAnimations.countdownPulse);

            this.ctx.fillStyle = '#FF6B35';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = '#FFD700';
            this.ctx.fillText(Math.ceil(this.countdown / 60), 0, 0);

            this.ctx.restore();
        }

        this.ctx.shadowBlur = 0;
    }

    drawCountdownBrawler(brawlerKey, x, y, isPlayer = false, small = false) {
        const brawler = this.brawlers[brawlerKey];
        const size = small ? 20 : 40;

        // Brawler representation
        this.ctx.fillStyle = brawler.color;
        this.ctx.shadowBlur = isPlayer ? 15 : 8;
        this.ctx.shadowColor = brawler.color;
        this.ctx.fillRect(x - size/2, y - size/2, size, size);

        // Name
        this.ctx.fillStyle = isPlayer ? '#FFD700' : '#FFFFFF';
        this.ctx.font = isPlayer ? 'bold 16px Arial' : '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.shadowBlur = 3;
        this.ctx.shadowColor = '#000000';
        this.ctx.fillText(brawler.name.toUpperCase(), x, y + size + 15);

        if (isPlayer) {
            this.ctx.fillStyle = '#4CAF50';
            this.ctx.font = '12px Arial';
            this.ctx.fillText('YOU', x, y + size + 30);
        }

        this.ctx.shadowBlur = 0;
    }

    drawResultsScreen() {
        // Results screen (placeholder for future)
        this.ctx.fillStyle = '#1E3A8A';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.width / 2, this.height / 2);

        this.ctx.font = '16px Arial';
        this.ctx.fillText('Click to return to home', this.width / 2, this.height / 2 + 40);
    }

    drawGameplay() {
        // Save context for camera transformation
        this.ctx.save();

        // Apply camera transformation
        this.ctx.translate(-this.camera.x, -this.camera.y);

        // Clear canvas with arena background (larger map)
        const gradient = this.ctx.createRadialGradient(this.mapWidth/2, this.mapHeight/2, 0, this.mapWidth/2, this.mapHeight/2, this.mapWidth/2);
        gradient.addColorStop(0, '#2a4d3a');
        gradient.addColorStop(1, '#1a2d2a');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.mapWidth, this.mapHeight);

        // Draw map boundaries
        this.ctx.strokeStyle = '#ffaa00';
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(10, 10, this.mapWidth - 20, this.mapHeight - 20);

        // Draw grid pattern for map
        this.ctx.strokeStyle = 'rgba(255, 170, 0, 0.1)';
        this.ctx.lineWidth = 1;
        for (let x = 0; x < this.mapWidth; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.mapHeight);
            this.ctx.stroke();
        }
        for (let y = 0; y < this.mapHeight; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.mapWidth, y);
            this.ctx.stroke();
        }

        // Draw grass patches first (behind everything)
        for (let grass of this.grass) {
            // Create grass texture with multiple green tones
            const gradient = this.ctx.createRadialGradient(
                grass.x + grass.width/2, grass.y + grass.height/2, 0,
                grass.x + grass.width/2, grass.y + grass.height/2, grass.width/2
            );
            gradient.addColorStop(0, '#90EE90');
            gradient.addColorStop(0.5, '#32CD32');
            gradient.addColorStop(1, '#228B22');

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(grass.x, grass.y, grass.width, grass.height);

            // Add grass texture dots
            this.ctx.fillStyle = 'rgba(34, 139, 34, 0.3)';
            for (let i = 0; i < 10; i++) {
                const dotX = grass.x + Math.random() * grass.width;
                const dotY = grass.y + Math.random() * grass.height;
                this.ctx.beginPath();
                this.ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        // Draw walls (simple stone-like appearance)
        for (let wall of this.walls) {
            // Stone wall appearance
            this.ctx.fillStyle = '#696969';
            this.ctx.shadowBlur = 5;
            this.ctx.shadowColor = '#000000';
            this.ctx.fillRect(wall.x, wall.y, wall.width, wall.height);

            // Wall border/texture
            this.ctx.strokeStyle = '#2F4F4F';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(wall.x, wall.y, wall.width, wall.height);

            // Add stone texture
            this.ctx.fillStyle = 'rgba(128, 128, 128, 0.3)';
            for (let i = 0; i < 6; i++) {
                const dotX = wall.x + Math.random() * wall.width;
                const dotY = wall.y + Math.random() * wall.height;
                this.ctx.beginPath();
                this.ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
                this.ctx.fill();
            }

            this.ctx.shadowBlur = 0;
        }

        // Draw gems
        for (let gem of this.gems) {
            if (!gem.collected) {
                this.ctx.save();
                this.ctx.translate(gem.x, gem.y);
                this.ctx.scale(1 + Math.sin(gem.bounce) * 0.2, 1 + Math.sin(gem.bounce) * 0.2);
                this.ctx.fillStyle = '#00ff88';
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = '#00ff88';
                this.ctx.fillRect(-gem.size/2, -gem.size/2, gem.size, gem.size);
                this.ctx.restore();
            }
        }

        // Draw power-ups
        for (let powerUp of this.powerUps) {
            if (!powerUp.collected) {
                this.ctx.save();
                this.ctx.translate(powerUp.x, powerUp.y);
                this.ctx.scale(1 + Math.sin(powerUp.bounce) * 0.3, 1 + Math.sin(powerUp.bounce) * 0.3);
                this.ctx.fillStyle = this.powerUpTypes[powerUp.type].color;
                this.ctx.shadowBlur = 12;
                this.ctx.shadowColor = this.powerUpTypes[powerUp.type].color;
                this.ctx.fillRect(-powerUp.size/2, -powerUp.size/2, powerUp.size, powerUp.size);
                this.ctx.restore();
            }
        }

        // Draw super effects
        for (let effect of this.superEffects) {
            if (effect.type === 'barrel') {
                this.ctx.fillStyle = '#8B4513';
                this.ctx.shadowBlur = 20;
                this.ctx.shadowColor = '#ff6600';
                this.ctx.fillRect(effect.x - effect.size/2, effect.y - effect.size/2, effect.size, effect.size);

                // Blinking effect when about to explode
                if (effect.timer < 30 && Math.floor(effect.timer / 5) % 2) {
                    this.ctx.fillStyle = '#ff3366';
                    this.ctx.fillRect(effect.x - effect.size/2, effect.y - effect.size/2, effect.size, effect.size);
                }
            } else if (effect.type === 'peep') {
                // Draw Nani's Peep robot
                this.ctx.fillStyle = '#00ccff';
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = '#00ccff';
                this.ctx.fillRect(effect.x - effect.size/2, effect.y - effect.size/2, effect.size, effect.size);

                // Draw Peep's eye
                this.ctx.fillStyle = '#ffffff';
                this.ctx.shadowBlur = 0;
                this.ctx.fillRect(effect.x - 4, effect.y - 4, 8, 8);
            }
        }

        // Draw animated player brawler
        this.drawAnimatedPlayer();

        // Reset opacity and shadow
        this.ctx.globalAlpha = 1;
        this.ctx.shadowBlur = 0;

        // Draw reload animations above player
        this.drawReloadAnimations();

        // Draw enemies
        for (let enemy of this.enemies) {
            if (enemy.health > 0) {
                this.ctx.fillStyle = enemy.color;
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = enemy.color;
                this.ctx.fillRect(enemy.x - enemy.size/2, enemy.y - enemy.size/2, enemy.size, enemy.size);

                // Health bar
                this.ctx.fillStyle = '#ff3366';
                this.ctx.fillRect(enemy.x - 15, enemy.y - 20, 30 * (enemy.health / enemy.maxHealth), 4);
            }
        }

        // Draw bullets with enhanced effects
        this.ctx.shadowBlur = 5;
        for (let bullet of this.bullets) {
            if (bullet.type === 'nani_orb') {
                // Nani's orb projectiles
                this.ctx.fillStyle = '#ff00ff';
                this.ctx.shadowColor = '#ff00ff';
                this.ctx.shadowBlur = 12;
                this.ctx.beginPath();
                this.ctx.arc(bullet.x, bullet.y, 6, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (bullet.type === 'hank_bubble' || bullet.type === 'super_bubble') {
                // Hank's bubble attacks
                this.ctx.fillStyle = 'rgba(0, 255, 255, 0.6)';
                this.ctx.shadowColor = '#00ffff';
                this.ctx.shadowBlur = 10;
                this.ctx.beginPath();
                this.ctx.arc(bullet.x, bullet.y, 8, 0, Math.PI * 2);
                this.ctx.fill();
                // Bubble outline
                this.ctx.strokeStyle = '#00ffff';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            } else if (bullet.type === 'mortis_dash') {
                // Mortis dash area effect
                this.ctx.fillStyle = 'rgba(128, 0, 128, 0.5)';
                this.ctx.shadowColor = '#800080';
                this.ctx.shadowBlur = 20;
                this.ctx.beginPath();
                this.ctx.arc(bullet.x, bullet.y, 30, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (bullet.type === 'bat') {
                // Mortis bat swarm
                this.ctx.fillStyle = '#4a0a4a';
                this.ctx.shadowColor = '#800080';
                this.ctx.shadowBlur = 8;
                this.ctx.beginPath();
                this.ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (bullet.super) {
                // Other super bullets
                this.ctx.fillStyle = '#ffaa00';
                this.ctx.shadowColor = '#ffaa00';
                this.ctx.shadowBlur = 15;
                this.ctx.beginPath();
                this.ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                // Default bullets
                this.ctx.fillStyle = bullet.owner === 'player' ? '#ffff00' : '#ff6600';
                this.ctx.shadowColor = bullet.owner === 'player' ? '#ffff00' : '#ff6600';
                this.ctx.shadowBlur = 5;
                this.ctx.beginPath();
                this.ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        // Draw particles
        for (let particle of this.particles) {
            const opacity = particle.life / 30;
            this.ctx.globalAlpha = opacity;
            this.ctx.fillStyle = particle.color;
            this.ctx.shadowColor = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.globalAlpha = 1;
        this.ctx.shadowBlur = 0;

        // Draw damage numbers
        for (let dmg of this.damageNumbers) {
            this.ctx.globalAlpha = dmg.opacity;
            this.ctx.fillStyle = dmg.color;
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(dmg.damage, dmg.x, dmg.y);
        }

        this.ctx.globalAlpha = 1;

        // Restore context (end camera transformation)
        this.ctx.restore();

        // Draw UI elements (not affected by camera)
        this.drawUI();

    }





    drawUI() {
        // Draw minimap
        const minimapSize = 120;
        const minimapX = this.width - minimapSize - 10;
        const minimapY = 10;

        // Minimap background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize);

        this.ctx.strokeStyle = '#ffaa00';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(minimapX, minimapY, minimapSize, minimapSize);

        // Player position on minimap
        const playerMinimapX = minimapX + (this.player.x / this.mapWidth) * minimapSize;
        const playerMinimapY = minimapY + (this.player.y / this.mapHeight) * minimapSize;

        this.ctx.fillStyle = '#00aaff';
        this.ctx.beginPath();
        this.ctx.arc(playerMinimapX, playerMinimapY, 3, 0, Math.PI * 2);
        this.ctx.fill();

        // Camera view on minimap
        const cameraMinimapX = minimapX + (this.camera.x / this.mapWidth) * minimapSize;
        const cameraMinimapY = minimapY + (this.camera.y / this.mapHeight) * minimapSize;
        const cameraMinimapW = (this.width / this.mapWidth) * minimapSize;
        const cameraMinimapH = (this.height / this.mapHeight) * minimapSize;

        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(cameraMinimapX, cameraMinimapY, cameraMinimapW, cameraMinimapH);

        // Draw gems on minimap
        this.ctx.fillStyle = '#00ff88';
        for (let gem of this.gems) {
            if (!gem.collected) {
                const gemMinimapX = minimapX + (gem.x / this.mapWidth) * minimapSize;
                const gemMinimapY = minimapY + (gem.y / this.mapHeight) * minimapSize;
                this.ctx.beginPath();
                this.ctx.arc(gemMinimapX, gemMinimapY, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        // Draw enemies on minimap
        this.ctx.fillStyle = '#ff3366';
        for (let enemy of this.enemies) {
            if (enemy.health > 0) {
                const enemyMinimapX = minimapX + (enemy.x / this.mapWidth) * minimapSize;
                const enemyMinimapY = minimapY + (enemy.y / this.mapHeight) * minimapSize;
                this.ctx.beginPath();
                this.ctx.arc(enemyMinimapX, enemyMinimapY, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }

    win() {
        this.running = false;
        clearInterval(this.gameLoop);

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.fillStyle = '#00ff88';
        this.ctx.font = 'bold 30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('VICTORY!', this.width/2, this.height/2 - 20);

        this.ctx.fillStyle = '#ffaa00';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Gems Collected: ${this.gemsCollected}`, this.width/2, this.height/2 + 20);

        this.ctx.textAlign = 'left';
    }

    gameOver() {
        this.running = false;
        clearInterval(this.gameLoop);

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.fillStyle = '#ff3366';
        this.ctx.font = 'bold 30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.width/2, this.height/2 - 20);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Click "Start Brawl" to try again', this.width/2, this.height/2 + 40);

        this.ctx.textAlign = 'left';
    }

    selectBrawler(brawler) {
        // Only allow brawler selection when waiting to start
        if (!this.waitingToStart) {
            console.log('Cannot change brawler during battle!');
            return;
        }

        this.player.brawler = brawler;
        console.log(`Selected brawler: ${brawler}`);

        // Update UI
        document.querySelectorAll('.brawler-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`[data-brawler="${brawler}"]`).classList.add('selected');
    }
}

// Global functions
let brawlStarsGame = null;

function startBrawlStars() {
    console.log('🎮 START BRAWL STARS BUTTON CLICKED!');
    console.log('Current brawlStarsGame:', brawlStarsGame);

    try {
        if (!brawlStarsGame) {
            console.log('Creating new BrawlStars instance...');
            brawlStarsGame = new BrawlStars();
            console.log('BrawlStars instance created:', brawlStarsGame);
            console.log('Calling start() method...');
            brawlStarsGame.start();
            console.log('✅ Game started successfully!');
        } else {
            console.log('Game already exists, checking if running...');
            console.log('Game running status:', brawlStarsGame.running);
            // If game exists, make sure it's running
            if (!brawlStarsGame.running) {
                console.log('Restarting existing game...');
                brawlStarsGame.start();
            } else {
                console.log('Game already running!');
            }
        }
    } catch (error) {
        console.error('❌ Error starting Brawl Stars:', error);
        alert('Error starting game: ' + error.message);
    }
}

function resetBrawlStars() {
    console.log('Pausing/Resuming Brawl Stars...');

    if (brawlStarsGame && (brawlStarsGame.running || brawlStarsGame.countdownActive)) {
        // Just toggle pause instead of full reset
        brawlStarsGame.paused = !brawlStarsGame.paused;
        console.log(brawlStarsGame.paused ? 'Game paused' : 'Game resumed');
    } else if (brawlStarsGame) {
        // If game exists but isn't running, start it
        brawlStarsGame.start();
    }
}

function toggleBrawlFullscreen() {
    const canvas = document.getElementById('brawlGame');
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

// Simple canvas test function
function testCanvas() {
    console.log('🧪 TESTING CANVAS...');
    const canvas = document.getElementById('brawlGame');
    console.log('Canvas found:', !!canvas);

    if (canvas) {
        const ctx = canvas.getContext('2d');
        console.log('Canvas context:', !!ctx);

        // Simple test draw
        ctx.fillStyle = 'lime';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('CANVAS WORKS!', canvas.width/2, canvas.height/2);
        console.log('✅ Canvas test complete');
        return true;
    }
    console.log('❌ Canvas test failed');
    return false;
}

// Setup game and brawler selection when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, ready for game initialization');
});

// Comprehensive test function
function testCompleteFlow() {
    console.log('🔥 COMPREHENSIVE FLOW TEST STARTING...');

    try {
        // Test 1: Canvas exists
        const canvas = document.getElementById('brawlGame');
        console.log('✅ Test 1 - Canvas exists:', !!canvas);

        // Test 2: Can create game instance
        const testGame = new BrawlStars();
        console.log('✅ Test 2 - Game instance created:', !!testGame);

        // Test 3: Game can start
        testGame.start();
        console.log('✅ Test 3 - Game start() completed');

        // Test 4: Check game state
        console.log('✅ Test 4 - Initial game state:', testGame.gameState);

        // Test 5: Simulate canvas click on home screen
        console.log('✅ Test 5 - Simulating home screen click...');
        testGame.handleHomeClick(300, 375); // Click in the play button area

        // Test 6: Check if countdown started
        console.log('✅ Test 6 - Countdown active:', testGame.countdownActive);

        // Test 7: Wait for countdown to finish (simulate)
        setTimeout(() => {
            testGame.endCountdown();
            console.log('✅ Test 7 - After endCountdown, game state:', testGame.gameState);
            console.log('✅ Test 7 - Game running:', testGame.running);
        }, 100);

        console.log('🎉 ALL TESTS COMPLETED! Check results above.');

    } catch (error) {
        console.error('❌ TEST FAILED:', error);
    }
}

console.log('Brawl Stars game loaded successfully');