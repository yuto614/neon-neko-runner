const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const HIGH_SCORE_KEY = 'cat-game-high-score';

const COLOR_CYAN = '#00f6ff';
const COLOR_MAGENTA = '#ff2d95';
const COLOR_PURPLE = '#b14eff';
const COLOR_WHITE = '#f5f5ff';

const ground = {
  x: 0,
  y: 410,
  width: 800,
  height: 40,
  color: '#2e1a47',
};

const player = {
  x: 60,
  y: 358,
  width: 52,
  height: 52,
  color: COLOR_CYAN,
  vy: 0,
  isJumping: false,
};

const obstacle = {
  x: 750,
  y: 370,
  width: 30,
  height: 40,
  color: COLOR_MAGENTA,
};

const GRAVITY = 0.6;
const JUMP_STRENGTH = -12;
const BASE_OBSTACLE_SPEED = 4;
const MAX_OBSTACLE_SPEED = 10;
const SPEED_PER_SCORE = 0.005;
const OBSTACLE_MIN_WIDTH = 20;
const OBSTACLE_MAX_WIDTH = 50;
const OBSTACLE_MIN_HEIGHT = 30;
const OBSTACLE_MAX_HEIGHT = 70;
const groundY = ground.y - player.height;

const HORIZON_Y = 250;
const STAR_COLORS = [COLOR_CYAN, COLOR_PURPLE, COLOR_WHITE];
const STAR_COUNT = 50;
const GRID_ROWS = 6;
const GRID_COLUMNS = 9;
const TRAIL_MAX = 4;
const PARTICLE_COUNT = 6;
const PARTICLE_LIFETIME = 18;

const moon = {
  x: canvas.width - 90,
  y: 70,
  radius: 34,
  color: COLOR_MAGENTA,
};

const stars = Array.from({ length: STAR_COUNT }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * (HORIZON_Y - 20),
  radius: Math.random() * 1.5 + 0.5,
  color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
}));

let gameState = 'title';
let score = 0;
let highScore = Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0;
let obstacleSpeed = BASE_OBSTACLE_SPEED;
let trail = [];
let particles = [];

function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function randomizeObstacle() {
  obstacle.width = Math.round(randomRange(OBSTACLE_MIN_WIDTH, OBSTACLE_MAX_WIDTH));
  obstacle.height = Math.round(randomRange(OBSTACLE_MIN_HEIGHT, OBSTACLE_MAX_HEIGHT));
  obstacle.y = ground.y - obstacle.height;
  obstacle.x = canvas.width + randomRange(0, 80);
}

function spawnJumpParticles() {
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: player.x + player.width / 2,
      y: player.y + player.height,
      vx: randomRange(-1, 1),
      vy: randomRange(0.5, 1.5),
      life: PARTICLE_LIFETIME,
    });
  }
}

function startGame() {
  player.y = groundY;
  player.vy = 0;
  player.isJumping = false;

  obstacle.width = 30;
  obstacle.height = 40;
  obstacle.y = ground.y - obstacle.height;
  obstacle.x = 750;

  obstacleSpeed = BASE_OBSTACLE_SPEED;
  score = 0;
  trail.length = 0;
  particles.length = 0;
  gameState = 'playing';
}

window.addEventListener('keydown', (e) => {
  if (e.code !== 'Space') {
    return;
  }
  e.preventDefault();

  if (gameState === 'title' || gameState === 'gameover') {
    startGame();
    return;
  }

  if (!player.isJumping) {
    player.vy = JUMP_STRENGTH;
    player.isJumping = true;
    spawnJumpParticles();
  }
});

function update() {
  if (gameState !== 'playing') {
    return;
  }

  player.vy += GRAVITY;
  player.y += player.vy;

  if (player.y >= groundY) {
    player.y = groundY;
    player.vy = 0;
    player.isJumping = false;
  }

  if (player.isJumping) {
    trail.push({ x: player.x, y: player.y });
    if (trail.length > TRAIL_MAX) {
      trail.shift();
    }
  } else {
    trail.length = 0;
  }

  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 1;
  });
  particles = particles.filter((p) => p.life > 0);

  obstacle.x -= obstacleSpeed;
  if (obstacle.x + obstacle.width < 0) {
    randomizeObstacle();
  }

  if (isColliding(player, obstacle)) {
    gameState = 'gameover';
    if (score > highScore) {
      highScore = score;
      localStorage.setItem(HIGH_SCORE_KEY, String(highScore));
    }
    return;
  }

  score += 1;
  obstacleSpeed = Math.min(MAX_OBSTACLE_SPEED, BASE_OBSTACLE_SPEED + score * SPEED_PER_SCORE);
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#05050f');
  gradient.addColorStop(1, '#1a0a33');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawStars() {
  stars.forEach((star) => {
    ctx.beginPath();
    ctx.fillStyle = star.color;
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawMoon() {
  ctx.save();
  ctx.shadowColor = moon.color;
  ctx.shadowBlur = 25;
  ctx.fillStyle = moon.color;
  ctx.beginPath();
  ctx.arc(moon.x, moon.y, moon.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawHorizon() {
  ctx.save();
  ctx.shadowColor = COLOR_MAGENTA;
  ctx.shadowBlur = 8;
  ctx.strokeStyle = 'rgba(255, 45, 149, 0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, HORIZON_Y);
  ctx.lineTo(canvas.width, HORIZON_Y);
  ctx.stroke();
  ctx.restore();
}

function drawGrid() {
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 246, 255, 0.35)';
  ctx.lineWidth = 1;

  const vanishX = canvas.width / 2;

  for (let i = 0; i <= GRID_COLUMNS; i++) {
    const xBottom = (canvas.width / GRID_COLUMNS) * i;
    ctx.beginPath();
    ctx.moveTo(vanishX, HORIZON_Y);
    ctx.lineTo(xBottom, ground.y);
    ctx.stroke();
  }

  for (let i = 1; i <= GRID_ROWS; i++) {
    const t = i / GRID_ROWS;
    const y = HORIZON_Y + (ground.y - HORIZON_Y) * (t * t);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  ctx.restore();
}

function drawGround() {
  ctx.fillStyle = ground.color;
  ctx.fillRect(ground.x, ground.y, ground.width, ground.height);
}

function drawObstacle() {
  ctx.save();
  ctx.shadowColor = obstacle.color;
  ctx.shadowBlur = 14;
  ctx.fillStyle = '#3a0d2e';
  ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

  ctx.strokeStyle = obstacle.color;
  ctx.lineWidth = 3;
  ctx.strokeRect(obstacle.x + 1.5, obstacle.y + 1.5, obstacle.width - 3, obstacle.height - 3);

  ctx.fillStyle = obstacle.color;
  ctx.fillRect(obstacle.x, obstacle.y + 6, obstacle.width, 4);
  ctx.fillRect(obstacle.x, obstacle.y + obstacle.height - 10, obstacle.width, 4);
  ctx.restore();
}

function drawTrail() {
  trail.forEach((pos, index) => {
    const alpha = ((index + 1) / trail.length) * 0.25;
    ctx.fillStyle = `rgba(0, 246, 255, ${alpha})`;
    ctx.fillRect(pos.x, pos.y, player.width, player.height);
  });
}

function drawParticles() {
  particles.forEach((p) => {
    const alpha = p.life / PARTICLE_LIFETIME;
    ctx.fillStyle = `rgba(0, 246, 255, ${alpha})`;
    ctx.fillRect(p.x, p.y, 3, 3);
  });
}

function drawPlayer() {
  ctx.save();
  ctx.shadowColor = player.color;
  ctx.shadowBlur = 15;
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  const earSize = 13;
  ctx.beginPath();
  ctx.moveTo(player.x + 4, player.y);
  ctx.lineTo(player.x + 4 + earSize / 2, player.y - earSize);
  ctx.lineTo(player.x + 4 + earSize, player.y);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(player.x + player.width - 4 - earSize, player.y);
  ctx.lineTo(player.x + player.width - 4 - earSize / 2, player.y - earSize);
  ctx.lineTo(player.x + player.width - 4, player.y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = '#0b0b1a';
  const eyeY = player.y + player.height * 0.4;
  ctx.fillRect(player.x + player.width * 0.22, eyeY, 5, 5);
  ctx.fillRect(player.x + player.width * 0.66, eyeY, 5, 5);

  ctx.fillStyle = COLOR_MAGENTA;
  ctx.fillRect(player.x + player.width * 0.46, player.y + player.height * 0.55, 5, 4);
}

function drawScore() {
  ctx.textAlign = 'left';
  ctx.fillStyle = COLOR_CYAN;
  ctx.font = '18px Orbitron, sans-serif';
  ctx.fillText('SCORE: ' + score, 20, 32);
  ctx.fillText('HIGH SCORE: ' + highScore, 20, 58);
}

function drawCenteredText(text, y, size) {
  ctx.textAlign = 'center';
  ctx.fillStyle = COLOR_CYAN;
  ctx.font = size + 'px Orbitron, sans-serif';
  ctx.fillText(text, canvas.width / 2, y);
}

function render() {
  drawBackground();
  drawStars();
  drawMoon();
  drawHorizon();
  drawGrid();
  drawGround();
  drawObstacle();
  drawTrail();
  drawParticles();
  drawPlayer();
  drawScore();

  if (gameState === 'title') {
    drawCenteredText('SPACE TO START', canvas.height / 2, 28);
  } else if (gameState === 'gameover') {
    const blinkOn = Math.floor(performance.now() / 400) % 2 === 0;
    if (blinkOn) {
      drawCenteredText('GAME OVER', canvas.height / 2 - 20, 34);
    }
    drawCenteredText('SPACE TO RESTART', canvas.height / 2 + 25, 20);
  }
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
