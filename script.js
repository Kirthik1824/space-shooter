// VARIABLES ----------------------------------------------------------------------------------------

let mouseX = 0;
let mouseY = 0;
let bullets = [];
let enemies = [];
let explosions = [];
let level = 1;
let gameOver = false;
let score = 0;
let health = 100;
let angle = 0;

// CONSTANTS ----------------------------------------------------------------------------------------

const canvas = document.getElementById('gamecanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const playerBaseImg = new Image();
playerBaseImg.src = './assets/space-turret.png';

const enemyShipImg = new Image();
enemyShipImg.src = './assets/enemy.png';

const collisionSound = new Audio('./assets/explosion.mp3');

const playerBase = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  width: 100,
  height: 100,
  color: "green",
};

// CLASSES -----------------------------------------------------------------------------------------

// Bullet Class
class Bullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.width = 5;
    this.height = 10;
    this.angle = angle;
    this.speed = 5;
  }

  update() {
    this.x += this.speed * Math.cos(this.angle);
    this.y += this.speed * Math.sin(this.angle);
  }

  draw() {
    ctx.fillStyle = 'red';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

// Enemy Class
class Enemy {
  constructor(x, y, speed) {
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 50;
    this.speed = speed;
  }

  update() {
    const angle = Math.atan2(playerBase.y - this.y, playerBase.x - this.x);
    this.x += this.speed * Math.cos(angle);
    this.y += this.speed * Math.sin(angle);
  }

  draw() {
    ctx.drawImage(enemyShipImg, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
  }
}

// Explosion Class
class Explosion {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 0;
    this.maxSize = 50;
    this.opacity = 1;
  }

  update() {
    if (this.size < this.maxSize) {
      this.size += 2;
      this.opacity -= 0.05;
    }
  }

  draw() {
    ctx.fillStyle = `rgba(255, 0, 0, ${this.opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// FUNCTIONS ---------------------------------------------------------------------------------------

// Player Base
function getTurretAngle() {
  const dx = mouseX - playerBase.x;
  const dy = mouseY - playerBase.y;
  return Math.atan2(dy, dx);
}

function drawPlayerBase() {
  const angle = getTurretAngle();
  ctx.save();
  ctx.translate(playerBase.x, playerBase.y);
  ctx.rotate(angle);
  ctx.drawImage(playerBaseImg, -playerBase.width / 2, -playerBase.height / 2, playerBase.width, playerBase.height);
  ctx.restore();
}

// Bullet Collision
function checkBulletCollision() {
  bullets.forEach((bullet, bulletIndex) => {
    enemies.forEach((enemy, enemyIndex) => {
      if (
        bullet.x < enemy.x + enemy.width &&
        bullet.x + bullet.width > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + bullet.height > enemy.y
      ) {
        explosions.push(new Explosion(enemy.x, enemy.y));
        playCollisionSound();
        bullets.splice(bulletIndex, 1);
        enemies.splice(enemyIndex, 1);
        score += 10;
      }
    });
  });
}

function playCollisionSound() {
  collisionSound.currentTime = 0;
  collisionSound.play();
}

function updateExplosions() {
  explosions.forEach((explosion, index) => {
    explosion.update();
    explosion.draw();
    if (explosion.opacity <= 0) {
      explosions.splice(index, 1);
    }
  });
}

// Enemies
function spawnEnemies() {
  for (let i = 0; i < level * 2; i++) {
    const side = Math.floor(Math.random() * 4);
    let x, y;
    const speed = level * 0.1 + 0.5;

    if (side === 0) {
      x = Math.random() * canvas.width;
      y = 0;
    } else if (side === 1) {
      x = canvas.width;
      y = Math.random() * canvas.height;
    } else if (side === 2) {
      x = Math.random() * canvas.width;
      y = canvas.height;
    } else {
      x = 0;
      y = Math.random() * canvas.height;
    }

    enemies.push(new Enemy(x, y, speed));
  }
}

// Game State
function displayGameOver() {
  ctx.fillStyle = 'white';
  ctx.font = '30px Arial';
  ctx.fillText("Game Over!", canvas.width / 2 - 90, canvas.height / 2);
  ctx.fillText("Click to restart", canvas.width / 2 - 100, canvas.height / 2 + 40);
}

function resetGame() {
  gameOver = false;
  level = 1;
  bullets = [];
  enemies = [];
  health = 100;
  spawnEnemies();
  gameLoop();
}

function checkLevelCompletion() {
  if (enemies.length === 0) {
    level++;
    spawnEnemies();
  }
}

function displayScore() {
  ctx.fillStyle = 'white';
  ctx.font = '24px Arial';
  ctx.fillText('Score: ' + score, 20, 40);
}

function displayHealth() {
  ctx.fillStyle = 'white';
  ctx.font = '24px Arial';
  ctx.fillText('Health: ' + health, 20, 80);
  ctx.fillRect(20, 100, health * 2, 20);
}

function startGame() {
  document.getElementById('instructions').style.display = 'none';
  spawnEnemies();
  gameLoop();
}

// EVENT LISTENERS ---------------------------------------------------------------------------------

canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = event.clientX - rect.left;
  mouseY = event.clientY - rect.top;
  angle = Math.atan2(event.clientY - playerBase.y, event.clientX - playerBase.x);
});

canvas.addEventListener("click", (e) => {
  if (gameOver) {
    resetGame();
  } else {
    const angle = Math.atan2(e.clientY - playerBase.y, e.clientX - playerBase.x);
    bullets.push(new Bullet(playerBase.x, playerBase.y, angle));
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === ' ') {
    e.preventDefault();
    bullets.push(new Bullet(playerBase.x, playerBase.y, angle));
  }
});

document.getElementById('startBtn').addEventListener('click', startGame);

// GAME LOOP ---------------------------------------------------------------------------------------

function gameLoop() {
  if (gameOver) {
    displayGameOver();
    score = 0;
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updateExplosions();
  drawPlayerBase();

  bullets.forEach((bullet, index) => {
    bullet.update();
    bullet.draw();
    if (
      bullet.x < 0 ||
      bullet.x > canvas.width ||
      bullet.y < 0 ||
      bullet.y > canvas.height
    ) {
      bullets.splice(index, 1);
    }
  });

  checkBulletCollision();

  enemies.forEach((enemy, index) => {
    enemy.update();
    enemy.draw();
    if (
      Math.abs(enemy.x - playerBase.x) < playerBase.width / 2 &&
      Math.abs(enemy.y - playerBase.y) < playerBase.height / 2
    ) {
      health -= 10;
      enemies.splice(index, 1);
      if (health <= 0) {
        gameOver = true;
      }
    }
  });

  checkLevelCompletion();
  displayScore();
  displayHealth();

  requestAnimationFrame(gameLoop);
}
