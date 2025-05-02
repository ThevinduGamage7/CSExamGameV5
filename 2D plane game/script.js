// script.js
const gameContainer = document.getElementById('game-container');
const player = document.getElementById('player');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const levelDisplay = document.createElement('div');
levelDisplay.id = 'level';
levelDisplay.textContent = 'Level: 1';
gameContainer.appendChild(levelDisplay);

let score = 0;
let lives = 5;
let level = 1;
let playerX = window.innerWidth / 2 - 35; // Center the player (adjusted for new width)
let playerY = window.innerHeight - 90;
let bullets = [];
let enemies = [];
let enemyBullets = [];
let asteroids = [];
let lifeIcons = [];
let enemySpawnInterval = 3500; // Spawn enemy every 3.5 seconds (increased from 2.75)
let asteroidSpawnInterval = 4500; // Spawn asteroid every 4.5 seconds (increased from 3.5)
let lifeIconSpawnInterval = 20000; // Spawn life icon every 20 seconds (increased from 15)
let gameRunning = true;
let playerFireRate = 500; // Fire rate in milliseconds (lower = faster)
let lastFireTime = 0;

// Update player position
function updatePlayerPosition() {
    player.style.left = `${playerX}px`;
    player.style.top = `${playerY}px`;
}

// Initial player position
updatePlayerPosition();

// Player movement
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    
    const step = 10; // Reduced from 15 to slow down player movement
    if (e.key === 'ArrowLeft' && playerX > 0) {
        playerX -= step;
    } else if (e.key === 'ArrowRight' && playerX < window.innerWidth - 70) {
        playerX += step;
    } else if (e.key === 'ArrowUp' && playerY > 0) {
        playerY -= step;
    } else if (e.key === 'ArrowDown' && playerY < window.innerHeight - 70) {
        playerY += step;
    }
    updatePlayerPosition();
});

// Shooting
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    
    const currentTime = Date.now();
    if (e.key === ' ' && currentTime - lastFireTime > playerFireRate) {
        lastFireTime = currentTime;
        
        // Create bullet(s) based on level
        if (level === 1) {
            createBullet(playerX + 32.5, playerY);
        } else if (level === 2) {
            createBullet(playerX + 20, playerY);
            createBullet(playerX + 45, playerY);
        } else if (level >= 3) {
            createBullet(playerX + 10, playerY);
            createBullet(playerX + 32.5, playerY);
            createBullet(playerX + 55, playerY);
        }
    }
});

function createBullet(x, y) {
    const bullet = document.createElement('div');
    bullet.className = 'bullet';
    bullet.style.left = `${x}px`;
    bullet.style.top = `${y}px`;
    gameContainer.appendChild(bullet);
    bullets.push({
        element: bullet,
        x: x,
        y: y
    });
}

// Enemy spawning
const enemySpawnTimer = setInterval(() => {
    if (!gameRunning) return;
    
    const enemy = document.createElement('div');
    enemy.className = 'enemy';
    const enemyX = Math.random() * (window.innerWidth - 60);
    const enemyY = 0;
    enemy.style.left = `${enemyX}px`;
    enemy.style.top = `${enemyY}px`;
    gameContainer.appendChild(enemy);
    
    const enemyObj = {
        element: enemy,
        x: enemyX,
        y: enemyY,
        shootTimer: null
    };
    
    enemies.push(enemyObj);
    
    // Enemy shooting
    enemyObj.shootTimer = setInterval(() => {
        if (!gameRunning || !enemy.isConnected) {
            clearInterval(enemyObj.shootTimer);
            return;
        }
        
        const currentX = parseFloat(enemy.style.left) + 30;
        const currentY = parseFloat(enemy.style.top) + 60;
        
        const enemyBullet = document.createElement('div');
        enemyBullet.className = 'enemy-bullet';
        enemyBullet.style.left = `${currentX}px`;
        enemyBullet.style.top = `${currentY}px`;
        gameContainer.appendChild(enemyBullet);
        
        enemyBullets.push({
            element: enemyBullet,
            x: currentX,
            y: currentY
        });
    }, 2500); // Enemy shoots every 2.5 seconds
}, enemySpawnInterval);

// Asteroid spawning
const asteroidSpawnTimer = setInterval(() => {
    if (!gameRunning) return;
    
    const asteroid = document.createElement('div');
    asteroid.className = 'asteroid';
    const asteroidX = Math.random() * (window.innerWidth - 50);
    const asteroidY = 0;
    const asteroidSize = 30 + Math.random() * 30; // Random size between 30-60px
    
    asteroid.style.left = `${asteroidX}px`;
    asteroid.style.top = `${asteroidY}px`;
    asteroid.style.width = `${asteroidSize}px`;
    asteroid.style.height = `${asteroidSize}px`;
    
    // Random rotation
    const rotation = Math.random() * 360;
    asteroid.style.transform = `rotate(${rotation}deg)`;
    
    gameContainer.appendChild(asteroid);
    
    asteroids.push({
        element: asteroid,
        x: asteroidX,
        y: asteroidY,
        size: asteroidSize,
        speed: 0.5 + Math.random() * 2, // Reduced speed (from 1 + Math.random() * 3)
        rotation: rotation,
        rotationSpeed: -2 + Math.random() * 4 // Random rotation speed
    });
}, asteroidSpawnInterval);

// Life icon spawning
const lifeIconSpawnTimer = setInterval(() => {
    if (!gameRunning) return;
    
    const lifeIcon = document.createElement('div');
    lifeIcon.className = 'life-pickup';
    const lifeIconX = Math.random() * (window.innerWidth - 30);
    const lifeIconY = 0;
    
    lifeIcon.style.left = `${lifeIconX}px`;
    lifeIcon.style.top = `${lifeIconY}px`;
    
    gameContainer.appendChild(lifeIcon);
    
    lifeIcons.push({
        element: lifeIcon,
        x: lifeIconX,
        y: lifeIconY
    });
}, lifeIconSpawnInterval);

// Game loop
function gameLoop() {
    if (!gameRunning) return;
    
    // Check for level up based on score
    const newLevel = Math.floor(score / 100) + 1;
    if (newLevel > level) {
        level = newLevel;
        levelDisplay.textContent = `Level: ${level}`;
        
        // Adjust fire rate based on score
        playerFireRate = Math.max(100, 500 - (level - 1) * 75);
        
        // Update player appearance based on level
        player.className = `player level-${Math.min(level, 3)}`;
        
        // Increase game speed by 10% every level
        enemySpawnInterval *= 0.9;
        asteroidSpawnInterval *= 0.9;
        enemyBullets.forEach(bullet => bullet.speed *= 1.1);
        enemies.forEach(enemy => enemy.speed *= 1.1);
        asteroids.forEach(asteroid => asteroid.speed *= 1.1);
    }
    
    // Move player bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.y -= 7; // Reduced from 10 to slow down bullets
        bullet.element.style.top = `${bullet.y}px`;
        
        // Remove bullet if off-screen
        if (bullet.y < 0) {
            bullet.element.remove();
            bullets.splice(i, 1);
            continue;
        }
        
        const bulletRect = bullet.element.getBoundingClientRect();
        
        // Check for collisions with enemies
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            const enemyRect = enemy.element.getBoundingClientRect();
            
            if (
                bulletRect.left < enemyRect.right &&
                bulletRect.right > enemyRect.left &&
                bulletRect.top < enemyRect.bottom &&
                bulletRect.bottom > enemyRect.top
            ) {
                // Collision detected
                clearInterval(enemy.shootTimer);
                enemy.element.remove();
                enemies.splice(j, 1);
                
                bullet.element.remove();
                bullets.splice(i, 1);
                
                const oldScore = score;
                score += 10;
                animateScoreChange(oldScore, score);
                break;
            }
        }
        
        // Check for collisions with asteroids
        if (bullet.element.isConnected) {
            for (let j = asteroids.length - 1; j >= 0; j--) {
                const asteroid = asteroids[j];
                const asteroidRect = asteroid.element.getBoundingClientRect();
                
                if (
                    bulletRect.left < asteroidRect.right &&
                    bulletRect.right > asteroidRect.left &&
                    bulletRect.top < asteroidRect.bottom &&
                    bulletRect.bottom > asteroidRect.top
                ) {
                    // Collision detected
                    asteroid.element.remove();
                    asteroids.splice(j, 1);
                    
                    bullet.element.remove();
                    bullets.splice(i, 1);
                    
                    const oldScore = score;
                    score += 5;
                    animateScoreChange(oldScore, score);
                    break;
                }
            }
        }
    }
    
    // Move enemy bullets
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const enemyBullet = enemyBullets[i];
        enemyBullet.y += 3; // Reduced from 5 to slow down enemy bullets
        enemyBullet.element.style.top = `${enemyBullet.y}px`;
        
        // Remove enemy bullet if off-screen
        if (enemyBullet.y > window.innerHeight) {
            enemyBullet.element.remove();
            enemyBullets.splice(i, 1);
            continue;
        }
        
        // Check for collisions with player
        const playerRect = player.getBoundingClientRect();
        const enemyBulletRect = enemyBullet.element.getBoundingClientRect();
        
        if (
            playerRect.left < enemyBulletRect.right &&
            playerRect.right > enemyBulletRect.left &&
            playerRect.top < enemyBulletRect.bottom &&
            playerRect.bottom > enemyBulletRect.top
        ) {
            // Collision detected
            enemyBullet.element.remove();
            enemyBullets.splice(i, 1);
            lives--;
            updateLivesDisplay();
            
            // Game over
            if (lives <= 0) {
                gameOver();
            }
        }
    }
    
    // Move enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.y += 1.5; // Reduced from 2 to slow down enemies
        enemy.element.style.top = `${enemy.y}px`;
        
        // Remove enemy if off-screen
        if (enemy.y > window.innerHeight) {
            clearInterval(enemy.shootTimer);
            enemy.element.remove();
            enemies.splice(i, 1);
            continue;
        }
        
        // Check for collisions with player
        const playerRect = player.getBoundingClientRect();
        const enemyRect = enemy.element.getBoundingClientRect();
        
        if (
            playerRect.left < enemyRect.right &&
            playerRect.right > enemyRect.left &&
            playerRect.top < enemyRect.bottom &&
            playerRect.bottom > enemyRect.top
        ) {
            // Collision detected
            clearInterval(enemy.shootTimer);
            enemy.element.remove();
            enemies.splice(i, 1);
            lives--;
            updateLivesDisplay();
            
            // Game over
            if (lives <= 0) {
                gameOver();
            }
        }
    }
    
    // Move asteroids
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        asteroid.y += asteroid.speed; // Speed already reduced
        asteroid.rotation += asteroid.rotationSpeed; // Rotate asteroid
        
        asteroid.element.style.top = `${asteroid.y}px`;
        asteroid.element.style.transform = `rotate(${asteroid.rotation}deg)`;
        
        // Remove asteroid if off-screen
        if (asteroid.y > window.innerHeight) {
            asteroid.element.remove();
            asteroids.splice(i, 1);
            continue;
        }
        
        // Check for collisions with player
        const playerRect = player.getBoundingClientRect();
        const asteroidRect = asteroid.element.getBoundingClientRect();
        
        if (
            playerRect.left < asteroidRect.right &&
            playerRect.right > asteroidRect.left &&
            playerRect.top < asteroidRect.bottom &&
            playerRect.bottom > asteroidRect.top
        ) {
            // Collision detected
            asteroid.element.remove();
            asteroids.splice(i, 1);
            lives--;
            updateLivesDisplay();
            
            // Game over
            if (lives <= 0) {
                gameOver();
            }
        }
    }
    
    // Move life icons
    for (let i = lifeIcons.length - 1; i >= 0; i--) {
        const lifeIcon = lifeIcons[i];
        lifeIcon.y += 1.5; // Reduced from 2 to slow down life icons
        lifeIcon.element.style.top = `${lifeIcon.y}px`;
        
        // Remove life icon if off-screen
        if (lifeIcon.y > window.innerHeight) {
            lifeIcon.element.remove();
            lifeIcons.splice(i, 1);
            continue;
        }
        
        // Check for collisions with player
        const playerRect = player.getBoundingClientRect();
        const lifeIconRect = lifeIcon.element.getBoundingClientRect();
        
        if (
            playerRect.left < lifeIconRect.right &&
            playerRect.right > lifeIconRect.left &&
            playerRect.top < lifeIconRect.bottom &&
            playerRect.bottom > lifeIconRect.top
        ) {
            // Collision detected - add life only if lives are less than 6
            if (lives < 6) {
                lifeIcon.element.remove();
                lifeIcons.splice(i, 1);
                lives++;
                updateLivesDisplay();
                
                // Show pickup notification
                const notification = document.createElement('div');
                notification.className = 'notification';
                notification.textContent = '+1 Life!';
                notification.style.left = `${playerX}px`;
                notification.style.top = `${playerY - 30}px`;
                gameContainer.appendChild(notification);
                
                // Remove notification after animation
                setTimeout(() => {
                    notification.remove();
                }, 1000);
            } else {
                // Optionally, you can show a notification that the player has max lives
                const notification = document.createElement('div');
                notification.className = 'notification';
                notification.textContent = 'Max Lives!';
                notification.style.left = `${playerX}px`;
                notification.style.top = `${playerY - 30}px`;
                gameContainer.appendChild(notification);
                
                // Remove notification after animation
                setTimeout(() => {
                    notification.remove();
                }, 1000);
            }
        }
    }
    
    requestAnimationFrame(gameLoop);
}

function updateLivesDisplay() {
    livesDisplay.innerHTML = '';
    for (let i = 0; i < lives; i++) {
        const lifeIcon = document.createElement('div');
        lifeIcon.className = 'life-icon';
        livesDisplay.appendChild(lifeIcon);
    }
}

function gameOver() {
    gameRunning = false;
    clearInterval(enemySpawnTimer);
    clearInterval(asteroidSpawnTimer);
    clearInterval(lifeIconSpawnTimer);
    
    // Clear all enemy shoot timers
    enemies.forEach(enemy => {
        clearInterval(enemy.shootTimer);
    });
    
    setTimeout(() => {
        alert(`Game Over! Your score: ${score}, Level: ${level}`);
        window.location.reload();
    }, 100);
}

// New function to animate score changes
function animateScoreChange(oldScore, newScore) {
    // Create a floating score indicator
    const scoreIndicator = document.createElement('div');
    scoreIndicator.className = 'score-indicator';
    scoreIndicator.textContent = `+${newScore - oldScore}`;
    scoreIndicator.style.left = `${playerX + 35}px`;
    scoreIndicator.style.top = `${playerY - 20}px`;
    gameContainer.appendChild(scoreIndicator);
    
    // Remove indicator after animation completes
    setTimeout(() => {
        scoreIndicator.remove();
    }, 1000);
    
    // Animate the score counter
    let displayScore = oldScore;
    const duration = 500; // Animation duration in ms
    const start = performance.now();
    
    function updateCounter(timestamp) {
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        
        displayScore = Math.floor(oldScore + (newScore - oldScore) * progress);
        scoreDisplay.textContent = `Score: ${displayScore}`;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Add CSS for new elements
const style = document.createElement('style');
style.textContent = `
.enemy-bullet {
  position: absolute;
  width: 5px;
  height: 20px;
  background: red;
}

.asteroid {
  position: absolute;
  background: url('asteroid.png') no-repeat center/cover;
  border-radius: 50%;
}

.life-pickup {
  position: absolute;
  width: 30px;
  height: 30px;
  background: url('life.png') no-repeat center/cover;
  animation: pulse 1s infinite alternate;
}

@keyframes pulse {
  from { transform: scale(1); }
  to { transform: scale(1.2); }
}

.notification {
  position: absolute;
  color: #00ff00;
  font-size: 16px;
  font-weight: bold;
  text-shadow: 0 0 5px black;
  animation: float-up 1s forwards;
  pointer-events: none;
}

@keyframes float-up {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-30px); }
}

#level {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 20px;
}

.player.level-2 {
  background: url('player-level2.png') no-repeat center/cover;
}

.player.level-3 {
  background: url('player-level3.png') no-repeat center/cover;
}

.score-indicator {
  position: absolute;
  color: #ffff00;
  font-size: 18px;
  font-weight: bold;
  text-shadow: 0 0 5px #000000;
  animation: score-float 1s forwards;
  pointer-events: none;
  z-index: 100;
}

@keyframes score-float {
  0% { opacity: 0; transform: translateY(0) scale(0.5); }
  20% { opacity: 1; transform: translateY(-10px) scale(1.2); }
  100% { opacity: 0; transform: translateY(-40px) scale(1); }
}
`;
document.head.appendChild(style);

updateLivesDisplay();
gameLoop();