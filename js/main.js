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
  type: 'block',
};

const GRAVITY = 0.6;
const JUMP_STRENGTH = -12;
const BASE_OBSTACLE_SPEED = 4;
const MAX_OBSTACLE_SPEED = 10;
const ABSOLUTE_MAX_OBSTACLE_SPEED = 14;
const SPEED_PER_SCORE = 0.005;
const LEVEL_SPEED_BONUS = 0.6;
const OBSTACLE_MIN_WIDTH = 20;
const OBSTACLE_MAX_WIDTH = 50;
const OBSTACLE_MIN_HEIGHT = 30;
const OBSTACLE_MAX_HEIGHT = 70;
const OBSTACLE_TYPES = ['block', 'yarn', 'bone'];
const groundY = ground.y - player.height;

const HORIZON_Y = 250;
const STAR_COLORS = [COLOR_CYAN, COLOR_PURPLE, COLOR_WHITE];
const STAR_COUNT = 50;
const BONUS_STAR_COUNT = 40;
const SHOOTING_STAR_CHANCE = 0.01;
const BUILDING_COUNT = 10;
const GRID_ROWS = 6;
const GRID_COLUMNS = 9;
const TRAIL_MAX = 4;
const PARTICLE_COUNT = 6;
const PARTICLE_LIFETIME = 18;
const LANDING_PARTICLE_COUNT = 5;
const LANDING_PARTICLE_LIFETIME = 12;
const LEVEL_UP_DURATION = 60;
const GAME_OVER_FLASH_DURATION = 10;

const moon = {
  x: canvas.width - 90,
  y: 70,
  radius: 34,
  color: COLOR_MAGENTA,
};

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

function makeStar(visibleFrom) {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * (HORIZON_Y - 20),
    radius: Math.random() * 1.5 + 0.5,
    color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
    phase: Math.random() * Math.PI * 2,
    visibleFrom,
  };
}

function makeBuilding() {
  return {
    x: Math.random() * canvas.width,
    width: randomRange(30, 70),
    height: randomRange(40, 120),
    color: '#140a26',
  };
}

const stars = [
  ...Array.from({ length: STAR_COUNT }, () => makeStar(1)),
  ...Array.from({ length: BONUS_STAR_COUNT }, () => makeStar(2)),
];

const buildings = Array.from({ length: BUILDING_COUNT }, () => makeBuilding());

let gameState = 'title';
let score = 0;
let level = 1;
let highScore = Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0;
let obstacleSpeed = BASE_OBSTACLE_SPEED;
let trail = [];
let particles = [];
let shootingStars = [];
let levelUpTimer = 0;
let gameOverFlashTimer = 0;

function randomizeObstacle() {
  obstacle.width = Math.round(randomRange(OBSTACLE_MIN_WIDTH, OBSTACLE_MAX_WIDTH));
  obstacle.height = Math.round(randomRange(OBSTACLE_MIN_HEIGHT, OBSTACLE_MAX_HEIGHT));
  obstacle.y = ground.y - obstacle.height;
  obstacle.x = canvas.width + randomRange(0, 80);
  obstacle.type = level >= 3
    ? OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)]
    : 'block';
}

function spawnJumpParticles() {
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: player.x + player.width / 2,
      y: player.y + player.height,
      vx: randomRange(-1, 1),
      vy: randomRange(0.5, 1.5),
      life: PARTICLE_LIFETIME,
      maxLife: PARTICLE_LIFETIME,
      color: COLOR_CYAN,
    });
  }
}

function spawnLandingParticles() {
  for (let i = 0; i < LANDING_PARTICLE_COUNT; i++) {
    particles.push({
      x: player.x + player.width / 2,
      y: player.y + player.height,
      vx: randomRange(-1.5, 1.5),
      vy: randomRange(-0.5, 0),
      life: LANDING_PARTICLE_LIFETIME,
      maxLife: LANDING_PARTICLE_LIFETIME,
      color: COLOR_WHITE,
    });
  }
}

function maybeSpawnShootingStar() {
  if (level < 3 || Math.random() >= SHOOTING_STAR_CHANCE) {
    return;
  }
  shootingStars.push({
    x: Math.random() * canvas.width * 0.6,
    y: Math.random() * HORIZON_Y * 0.5,
    vx: 6,
    vy: 3,
    life: 30,
  });
}

function startGame() {
  player.y = groundY;
  player.vy = 0;
  player.isJumping = false;

  obstacle.width = 30;
  obstacle.height = 40;
  obstacle.y = ground.y - obstacle.height;
  obstacle.x = 750;
  obstacle.type = 'block';

  obstacleSpeed = BASE_OBSTACLE_SPEED;
  score = 0;
  level = 1;
  trail.length = 0;
  particles.length = 0;
  shootingStars.length = 0;
  levelUpTimer = 0;
  gameOverFlashTimer = 0;
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
  if (gameOverFlashTimer > 0) {
    gameOverFlashTimer -= 1;
  }

  if (gameState !== 'playing') {
    return;
  }

  if (levelUpTimer > 0) {
    levelUpTimer -= 1;
  }

  const wasJumping = player.isJumping;

  player.vy += GRAVITY;
  player.y += player.vy;

  if (player.y >= groundY) {
    player.y = groundY;
    player.vy = 0;
    player.isJumping = false;
    if (wasJumping) {
      spawnLandingParticles();
    }
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

  maybeSpawnShootingStar();
  shootingStars.forEach((s) => {
    s.x += s.vx;
    s.y += s.vy;
    s.life -= 1;
  });
  shootingStars = shootingStars.filter((s) => s.life > 0 && s.x < canvas.width);

  obstacle.x -= obstacleSpeed;
  if (obstacle.x + obstacle.width < 0) {
    randomizeObstacle();
  }

  if (isColliding(player, obstacle)) {
    gameState = 'gameover';
    gameOverFlashTimer = GAME_OVER_FLASH_DURATION;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem(HIGH_SCORE_KEY, String(highScore));
    }
    return;
  }

  score += 1;

  const previousLevel = level;
  level = Math.floor(score / 1000) + 1;
  if (level !== previousLevel) {
    levelUpTimer = LEVEL_UP_DURATION;
  }

  const maxSpeedForLevel = Math.min(ABSOLUTE_MAX_OBSTACLE_SPEED, MAX_OBSTACLE_SPEED + (level - 1) * LEVEL_SPEED_BONUS);
  obstacleSpeed = Math.min(maxSpeedForLevel, BASE_OBSTACLE_SPEED + score * SPEED_PER_SCORE);
}

function getSkyColors() {
  if (level < 6) {
    return ['#05050f', '#1a0a33'];
  }
  const hue = 220 + Math.sin(level * 0.4) * 35;
  return [`hsl(${hue}, 55%, 6%)`, `hsl(${hue}, 65%, 15%)`];
}

function drawBackground() {
  const [topColor, bottomColor] = getSkyColors();
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, topColor);
  gradient.addColorStop(1, bottomColor);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawStars() {
  const time = performance.now();
  stars.forEach((star) => {
    if (star.visibleFrom > level) {
      return;
    }
    ctx.globalAlpha = level >= 3 ? 0.5 + Math.sin(time / 600 + star.phase) * 0.5 : 1;
    ctx.beginPath();
    ctx.fillStyle = star.color;
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function drawShootingStars() {
  shootingStars.forEach((s) => {
    ctx.save();
    ctx.strokeStyle = `rgba(245, 245, 255, ${s.life / 30})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x - s.vx * 3, s.y - s.vy * 3);
    ctx.stroke();
    ctx.restore();
  });
}

function drawMoon() {
  ctx.save();
  ctx.shadowColor = moon.color;
  ctx.shadowBlur = level >= 5 ? 38 : 25;
  ctx.fillStyle = moon.color;
  ctx.beginPath();
  ctx.arc(moon.x, moon.y, moon.radius, 0, Math.PI * 2);
  ctx.fill();

  if (level >= 5) {
    ctx.beginPath();
    ctx.arc(moon.x, moon.y, moon.radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.strokeStyle = 'rgba(20, 5, 20, 0.55)';
    ctx.lineWidth = 3;
    for (let i = -2; i <= 2; i++) {
      const y = moon.y + i * (moon.radius / 2.5);
      ctx.beginPath();
      ctx.moveTo(moon.x - moon.radius, y);
      ctx.lineTo(moon.x + moon.radius, y);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawCity() {
  if (level < 4) {
    return;
  }
  buildings.forEach((b) => {
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, HORIZON_Y - b.height, b.width, b.height);

    ctx.fillStyle = 'rgba(0, 246, 255, 0.5)';
    const windowRows = Math.floor(b.height / 18);
    for (let row = 0; row < windowRows; row++) {
      const y = HORIZON_Y - b.height + 8 + row * 18;
      ctx.fillRect(b.x + 6, y, 4, 4);
      ctx.fillRect(b.x + b.width - 10, y, 4, 4);
    }
  });
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

function drawBlockObstacle() {
  ctx.fillStyle = '#3a0d2e';
  ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

  ctx.strokeStyle = obstacle.color;
  ctx.lineWidth = 3;
  ctx.strokeRect(obstacle.x + 1.5, obstacle.y + 1.5, obstacle.width - 3, obstacle.height - 3);

  ctx.fillStyle = obstacle.color;
  ctx.fillRect(obstacle.x, obstacle.y + 6, obstacle.width, 4);
  ctx.fillRect(obstacle.x, obstacle.y + obstacle.height - 10, obstacle.width, 4);
}

function drawYarnObstacle() {
  const cx = obstacle.x + obstacle.width / 2;
  const cy = obstacle.y + obstacle.height / 2;
  const r = Math.min(obstacle.width, obstacle.height) / 2;

  ctx.fillStyle = obstacle.color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#3a0d2e';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * 0.4, (Math.PI / 3) * i, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawBoneObstacle() {
  ctx.fillStyle = obstacle.color;
  const shaftHeight = obstacle.height * 0.35;
  const shaftY = obstacle.y + (obstacle.height - shaftHeight) / 2;
  ctx.fillRect(obstacle.x + 4, shaftY, obstacle.width - 8, shaftHeight);

  const r = obstacle.height * 0.28;
  [0.3, 0.7].forEach((t) => {
    ctx.beginPath();
    ctx.arc(obstacle.x + 4, obstacle.y + obstacle.height * t, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(obstacle.x + obstacle.width - 4, obstacle.y + obstacle.height * t, r, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawObstacle() {
  ctx.save();
  ctx.shadowColor = obstacle.color;
  ctx.shadowBlur = 14;

  if (obstacle.type === 'yarn') {
    drawYarnObstacle();
  } else if (obstacle.type === 'bone') {
    drawBoneObstacle();
  } else {
    drawBlockObstacle();
  }

  ctx.restore();
}

function drawTrail() {
  trail.forEach((pos, index) => {
    ctx.globalAlpha = ((index + 1) / trail.length) * 0.25;
    ctx.fillStyle = player.color;
    ctx.fillRect(pos.x, pos.y, player.width, player.height);
  });
  ctx.globalAlpha = 1;
}

function drawParticles() {
  particles.forEach((p) => {
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 3, 3);
  });
  ctx.globalAlpha = 1;
}

function drawPlayer() {
  const earSize = 13;

  ctx.save();
  ctx.shadowColor = player.color;
  ctx.shadowBlur = 10;
  ctx.strokeStyle = player.color;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  const tailBaseX = player.x + 2;
  const tailBaseY = player.y + player.height * 0.6;
  ctx.moveTo(tailBaseX, tailBaseY);
  ctx.quadraticCurveTo(tailBaseX - 16, tailBaseY - 4, tailBaseX - 12, tailBaseY - 22);
  ctx.stroke();
  ctx.restore();

  if (!player.isJumping) {
    const runFrame = Math.floor(performance.now() / 150) % 2;
    const legOffset = runFrame === 0 ? 0 : 4;
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x + 6 + legOffset, player.y + player.height - 4, 6, 4);
    ctx.fillRect(player.x + player.width - 12 - legOffset, player.y + player.height - 4, 6, 4);
  }

  ctx.save();
  ctx.shadowColor = player.color;
  ctx.shadowBlur = 15;
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

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

  ctx.fillStyle = 'rgba(255, 170, 200, 0.6)';
  const cheekY = player.y + player.height * 0.6;
  ctx.beginPath();
  ctx.arc(player.x + player.width * 0.16, cheekY, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(player.x + player.width * 0.84, cheekY, 4, 0, Math.PI * 2);
  ctx.fill();

  const eyeY = player.y + player.height * 0.38;
  const eyeSize = 7;
  ctx.fillStyle = '#0b0b1a';
  ctx.fillRect(player.x + player.width * 0.2, eyeY, eyeSize, eyeSize);
  ctx.fillRect(player.x + player.width * 0.65, eyeY, eyeSize, eyeSize);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(player.x + player.width * 0.2 + 1, eyeY + 1, 2, 2);
  ctx.fillRect(player.x + player.width * 0.65 + 1, eyeY + 1, 2, 2);

  ctx.fillStyle = COLOR_MAGENTA;
  ctx.fillRect(player.x + player.width * 0.46, player.y + player.height * 0.52, 5, 4);

  ctx.fillStyle = '#0b0b1a';
  ctx.font = `${Math.round(player.height * 0.26)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('ω', player.x + player.width / 2, player.y + player.height * 0.82);
}

function drawHud() {
  ctx.textAlign = 'left';
  ctx.fillStyle = COLOR_CYAN;
  ctx.font = '18px Orbitron, sans-serif';
  ctx.fillText('LEVEL ' + level, 20, 28);
  ctx.fillText('SCORE: ' + score, 20, 52);
  ctx.fillText('HIGH SCORE: ' + highScore, 20, 76);
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
  drawShootingStars();
  drawMoon();
  drawCity();
  drawHorizon();
  drawGrid();
  drawGround();
  drawObstacle();
  drawTrail();
  drawParticles();
  drawPlayer();
  drawHud();

  if (gameState === 'title') {
    drawCenteredText('SPACE TO START', canvas.height / 2, 28);
  } else if (gameState === 'gameover') {
    const blinkOn = Math.floor(performance.now() / 400) % 2 === 0;
    if (blinkOn) {
      drawCenteredText('GAME OVER', canvas.height / 2 - 20, 34);
    }
    drawCenteredText('SPACE TO RESTART', canvas.height / 2 + 25, 20);
  }

  if (levelUpTimer > 0) {
    const blinkOn = Math.floor(performance.now() / 200) % 2 === 0;
    if (blinkOn) {
      drawCenteredText('LEVEL UP!', canvas.height / 2 - 20, 30);
      drawCenteredText('LEVEL ' + level, canvas.height / 2 + 14, 22);
    }
  }

  if (gameOverFlashTimer > 0) {
    ctx.fillStyle = `rgba(255, 30, 30, ${(gameOverFlashTimer / GAME_OVER_FLASH_DURATION) * 0.35})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
