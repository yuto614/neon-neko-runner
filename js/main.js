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
  speedMultiplier: 1,
  nearMissChecked: false,
};

const GRAVITY = 0.6;
const JUMP_STRENGTH = -12;
const BASE_OBSTACLE_SPEED = 4;
const MAX_OBSTACLE_SPEED = 10;
const ABSOLUTE_MAX_OBSTACLE_SPEED = 14;
const SPEED_PER_SCORE = 0.005;
const LEVEL_SPEED_BONUS = 0.6;
const OBSTACLE_DEFS = {
  block: { minWidth: 26, maxWidth: 40, minHeight: 34, maxHeight: 46, speedMultiplier: 1 },
  yarn: { minWidth: 18, maxWidth: 26, minHeight: 18, maxHeight: 26, speedMultiplier: 1.15 },
  bone: { minWidth: 30, maxWidth: 44, minHeight: 22, maxHeight: 30, speedMultiplier: 1 },
  vacuum: { minWidth: 50, maxWidth: 62, minHeight: 26, maxHeight: 32, speedMultiplier: 1.2 },
  dog: { minWidth: 44, maxWidth: 56, minHeight: 48, maxHeight: 58, speedMultiplier: 0.85 },
  trashcan: { minWidth: 24, maxWidth: 30, minHeight: 58, maxHeight: 72, speedMultiplier: 1 },
};
const OBSTACLE_TYPES = Object.keys(OBSTACLE_DEFS);
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
const BLINK_MIN_INTERVAL = 180;
const BLINK_MAX_INTERVAL = 300;
const BLINK_DURATION = 6;
const HAPPY_DURATION = 20;

const NEAR_MISS_GAP = 18;
const NEAR_MISS_BASE_BONUS = 50;
const NEAR_MISS_COMBO_STEP = 10;
const NEAR_MISS_BONUS_CAP = 100;
const NICE_TEXT_DURATION = 60;
const COMBO_RESET_FRAMES = 150;
const COMBO_POPUP_DURATION = 90;
const MILESTONES = [1000, 3000, 5000, 10000];
const MILESTONE_DURATION = 100;
const RING_MAX_RADIUS = 70;
const RING_PARTICLE_COUNT = 8;

const SQUASH_DURATION = 12;
const HOLOGRAM_TEXTS = ['FISH', 'NEKO', 'CYBER CAT'];
const HOLOGRAM_CHANCE = 0.004;
const HOLOGRAM_SPEED = 1.5;
const HOLOGRAM_DURATION = 220;
const HOLOGRAM_FADE_FRAMES = 40;

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
    seed: Math.random() * Math.PI * 2,
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
let isBlinking = false;
let blinkTimer = Math.round(randomRange(BLINK_MIN_INTERVAL, BLINK_MAX_INTERVAL));
let blinkDuration = 0;
let happyTimer = 0;
let comboCount = 0;
let comboTimer = 0;
let comboPopupTimer = 0;
let niceTexts = [];
let milestoneTimer = 0;
let milestoneScore = 0;
let nextMilestoneIndex = 0;
let squashTimer = 0;
let squashMode = 'none';
let holograms = [];

function getAvailableObstacleTypes() {
  if (level < 3) {
    return ['block'];
  }
  if (level < 5) {
    return ['block', 'yarn', 'bone', 'vacuum'];
  }
  return OBSTACLE_TYPES;
}

function randomizeObstacle() {
  const types = getAvailableObstacleTypes();
  obstacle.type = types[Math.floor(Math.random() * types.length)];

  const def = OBSTACLE_DEFS[obstacle.type];
  obstacle.width = Math.round(randomRange(def.minWidth, def.maxWidth));
  obstacle.height = Math.round(randomRange(def.minHeight, def.maxHeight));
  obstacle.y = ground.y - obstacle.height;
  obstacle.x = canvas.width + randomRange(0, 80);
  obstacle.speedMultiplier = def.speedMultiplier;
  obstacle.nearMissChecked = false;
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
      color: COLOR_CYAN,
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

function maybeSpawnHologram() {
  if (level < 5 || Math.random() >= HOLOGRAM_CHANCE) {
    return;
  }
  holograms.push({
    x: canvas.width + 40,
    y: randomRange(40, HORIZON_Y - 60),
    text: HOLOGRAM_TEXTS[Math.floor(Math.random() * HOLOGRAM_TEXTS.length)],
    life: HOLOGRAM_DURATION,
    maxLife: HOLOGRAM_DURATION,
  });
}

function checkNearMiss() {
  if (!player.isJumping || obstacle.nearMissChecked) {
    return;
  }
  const horizontalOverlap = player.x < obstacle.x + obstacle.width && player.x + player.width > obstacle.x;
  if (!horizontalOverlap) {
    return;
  }
  const gap = obstacle.y - (player.y + player.height);
  if (gap > NEAR_MISS_GAP) {
    return;
  }
  obstacle.nearMissChecked = true;
  triggerNearMiss();
}

function triggerNearMiss() {
  comboCount += 1;
  comboTimer = COMBO_RESET_FRAMES;
  comboPopupTimer = COMBO_POPUP_DURATION;

  const bonus = Math.min(NEAR_MISS_BASE_BONUS + (comboCount - 1) * NEAR_MISS_COMBO_STEP, NEAR_MISS_BONUS_CAP);
  score += bonus;

  niceTexts.push({
    x: obstacle.x + obstacle.width / 2,
    y: obstacle.y - 10,
    bonus,
    life: NICE_TEXT_DURATION,
    maxLife: NICE_TEXT_DURATION,
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
  obstacle.speedMultiplier = OBSTACLE_DEFS.block.speedMultiplier;
  obstacle.nearMissChecked = false;

  obstacleSpeed = BASE_OBSTACLE_SPEED;
  score = 0;
  level = 1;
  trail.length = 0;
  particles.length = 0;
  shootingStars.length = 0;
  levelUpTimer = 0;
  gameOverFlashTimer = 0;
  isBlinking = false;
  blinkDuration = 0;
  blinkTimer = Math.round(randomRange(BLINK_MIN_INTERVAL, BLINK_MAX_INTERVAL));
  happyTimer = 0;
  comboCount = 0;
  comboTimer = 0;
  comboPopupTimer = 0;
  niceTexts.length = 0;
  milestoneTimer = 0;
  milestoneScore = 0;
  nextMilestoneIndex = 0;
  squashTimer = 0;
  squashMode = 'none';
  holograms.length = 0;
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
    squashTimer = SQUASH_DURATION;
    squashMode = 'jump';
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
      happyTimer = HAPPY_DURATION;
      squashTimer = SQUASH_DURATION;
      squashMode = 'land';
    }
  }

  if (happyTimer > 0) {
    happyTimer -= 1;
  }

  if (squashTimer > 0) {
    squashTimer -= 1;
  }

  if (comboTimer > 0) {
    comboTimer -= 1;
    if (comboTimer <= 0) {
      comboCount = 0;
    }
  }
  if (comboPopupTimer > 0) {
    comboPopupTimer -= 1;
  }
  if (milestoneTimer > 0) {
    milestoneTimer -= 1;
  }
  niceTexts.forEach((t) => {
    t.life -= 1;
  });
  niceTexts = niceTexts.filter((t) => t.life > 0);

  blinkTimer -= 1;
  if (blinkTimer <= 0) {
    isBlinking = true;
    blinkDuration = BLINK_DURATION;
    blinkTimer = Math.round(randomRange(BLINK_MIN_INTERVAL, BLINK_MAX_INTERVAL));
  }
  if (isBlinking) {
    blinkDuration -= 1;
    if (blinkDuration <= 0) {
      isBlinking = false;
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

  maybeSpawnHologram();
  holograms.forEach((h) => {
    h.x -= HOLOGRAM_SPEED;
    h.life -= 1;
  });
  holograms = holograms.filter((h) => h.life > 0 && h.x > -150);

  obstacle.x -= obstacleSpeed * obstacle.speedMultiplier;
  if (obstacle.x + obstacle.width < 0) {
    randomizeObstacle();
  }

  if (isColliding(player, obstacle)) {
    gameState = 'gameover';
    gameOverFlashTimer = GAME_OVER_FLASH_DURATION;
    comboCount = 0;
    comboTimer = 0;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem(HIGH_SCORE_KEY, String(highScore));
    }
    return;
  }

  checkNearMiss();

  score += 1;

  const previousLevel = level;
  level = Math.floor(score / 1000) + 1;
  if (level !== previousLevel) {
    levelUpTimer = LEVEL_UP_DURATION;
  }

  if (nextMilestoneIndex < MILESTONES.length && score >= MILESTONES[nextMilestoneIndex]) {
    milestoneScore = MILESTONES[nextMilestoneIndex];
    milestoneTimer = MILESTONE_DURATION;
    nextMilestoneIndex += 1;
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

function drawLevelUpGlow() {
  if (levelUpTimer <= 0) {
    return;
  }
  const progress = levelUpTimer / LEVEL_UP_DURATION;
  ctx.fillStyle = `rgba(180, 220, 255, ${progress * 0.25})`;
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
  const baseBlur = level >= 5 ? 38 : 25;
  const pulse = Math.sin(performance.now() / 500) * 4;
  ctx.save();
  ctx.shadowColor = moon.color;
  ctx.shadowBlur = baseBlur + pulse;
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
  const time = performance.now();
  buildings.forEach((b) => {
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, HORIZON_Y - b.height, b.width, b.height);

    ctx.fillStyle = 'rgba(0, 246, 255, 0.5)';
    const windowRows = Math.floor(b.height / 18);
    for (let row = 0; row < windowRows; row++) {
      const y = HORIZON_Y - b.height + 8 + row * 18;
      if (Math.sin(time / 600 + b.seed + row) > 0.1) {
        ctx.fillRect(b.x + 6, y, 4, 4);
      }
      if (Math.sin(time / 600 + b.seed + row * 1.7 + 1) > 0.1) {
        ctx.fillRect(b.x + b.width - 10, y, 4, 4);
      }
    }
  });
}

function drawHolograms() {
  const time = performance.now();
  holograms.forEach((h) => {
    const fadeIn = (h.maxLife - h.life) / HOLOGRAM_FADE_FRAMES;
    const fadeOut = h.life / HOLOGRAM_FADE_FRAMES;
    const fade = Math.max(0, Math.min(1, fadeIn, fadeOut));
    const flicker = 0.6 + Math.sin(time / 90 + h.x) * 0.4;

    ctx.save();
    ctx.globalAlpha = fade * flicker;
    ctx.textAlign = 'center';
    ctx.shadowColor = COLOR_PURPLE;
    ctx.shadowBlur = 14;
    ctx.fillStyle = COLOR_PURPLE;
    ctx.font = '20px Orbitron, sans-serif';
    ctx.fillText(h.text, h.x, h.y);
    ctx.restore();
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

  ctx.strokeStyle = 'rgba(245, 245, 255, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(obstacle.x + 4, obstacle.y + 4);
  ctx.lineTo(obstacle.x + obstacle.width - 4, obstacle.y + obstacle.height - 4);
  ctx.moveTo(obstacle.x + obstacle.width - 4, obstacle.y + 4);
  ctx.lineTo(obstacle.x + 4, obstacle.y + obstacle.height - 4);
  ctx.stroke();
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

function drawVacuumObstacle() {
  const bodyHeight = obstacle.height * 0.7;
  const bodyY = obstacle.y + (obstacle.height - bodyHeight);

  ctx.fillStyle = '#3a0d2e';
  ctx.beginPath();
  ctx.roundRect(obstacle.x, bodyY, obstacle.width, bodyHeight, bodyHeight / 2);
  ctx.fill();

  ctx.strokeStyle = obstacle.color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(obstacle.x, bodyY, obstacle.width, bodyHeight, bodyHeight / 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(obstacle.x + obstacle.width * 0.2, bodyY);
  ctx.quadraticCurveTo(
    obstacle.x + obstacle.width * 0.1, obstacle.y - 6,
    obstacle.x + obstacle.width * 0.32, obstacle.y - 2
  );
  ctx.stroke();

  ctx.fillStyle = obstacle.color;
  const wheelR = 3.5;
  ctx.beginPath();
  ctx.arc(obstacle.x + obstacle.width * 0.25, obstacle.y + obstacle.height - 2, wheelR, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(obstacle.x + obstacle.width * 0.75, obstacle.y + obstacle.height - 2, wheelR, 0, Math.PI * 2);
  ctx.fill();
}

function drawDogObstacle() {
  const bodyY = obstacle.y + obstacle.height * 0.25;
  const bodyHeight = obstacle.height * 0.75;

  ctx.fillStyle = '#3a0d2e';
  ctx.beginPath();
  ctx.roundRect(obstacle.x, bodyY, obstacle.width, bodyHeight, 10);
  ctx.fill();

  ctx.strokeStyle = obstacle.color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(obstacle.x, bodyY, obstacle.width, bodyHeight, 10);
  ctx.stroke();

  ctx.fillStyle = obstacle.color;
  ctx.beginPath();
  ctx.moveTo(obstacle.x + obstacle.width * 0.15, bodyY);
  ctx.lineTo(obstacle.x + obstacle.width * 0.05, obstacle.y);
  ctx.lineTo(obstacle.x + obstacle.width * 0.3, bodyY - 2);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(obstacle.x + obstacle.width * 0.7, bodyY);
  ctx.lineTo(obstacle.x + obstacle.width * 0.8, obstacle.y);
  ctx.lineTo(obstacle.x + obstacle.width * 0.95, bodyY - 2);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = obstacle.color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(obstacle.x + obstacle.width, bodyY + bodyHeight * 0.4);
  ctx.quadraticCurveTo(
    obstacle.x + obstacle.width + 10, bodyY + bodyHeight * 0.1,
    obstacle.x + obstacle.width + 4, bodyY - 6
  );
  ctx.stroke();
}

function drawTrashcanObstacle() {
  ctx.fillStyle = '#3a0d2e';
  ctx.fillRect(obstacle.x, obstacle.y + 6, obstacle.width, obstacle.height - 6);

  ctx.strokeStyle = obstacle.color;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(obstacle.x + 1, obstacle.y + 7, obstacle.width - 2, obstacle.height - 8);

  ctx.fillStyle = obstacle.color;
  ctx.fillRect(obstacle.x - 2, obstacle.y, obstacle.width + 4, 6);

  ctx.strokeStyle = 'rgba(245, 245, 255, 0.4)';
  ctx.lineWidth = 1;
  for (let i = 1; i <= 2; i++) {
    const y = obstacle.y + 6 + ((obstacle.height - 6) / 3) * i;
    ctx.beginPath();
    ctx.moveTo(obstacle.x + 2, y);
    ctx.lineTo(obstacle.x + obstacle.width - 2, y);
    ctx.stroke();
  }
}

function drawObstacle() {
  ctx.save();
  ctx.shadowColor = obstacle.color;
  ctx.shadowBlur = 14;

  if (obstacle.type === 'yarn') {
    drawYarnObstacle();
  } else if (obstacle.type === 'bone') {
    drawBoneObstacle();
  } else if (obstacle.type === 'vacuum') {
    drawVacuumObstacle();
  } else if (obstacle.type === 'dog') {
    drawDogObstacle();
  } else if (obstacle.type === 'trashcan') {
    drawTrashcanObstacle();
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

function getExpression() {
  if (isBlinking) {
    return 'blink';
  }
  if (happyTimer > 0) {
    return 'happy';
  }
  if (player.isJumping) {
    return 'jumping';
  }
  return 'normal';
}

function drawTail() {
  const tailSway = Math.sin(performance.now() / 280) * (player.isJumping ? 8 : 4);
  ctx.save();
  ctx.shadowColor = player.color;
  ctx.shadowBlur = 12;
  ctx.strokeStyle = player.color;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  const tailBaseX = player.x + 4;
  const tailBaseY = player.y + player.height * 0.55;
  ctx.moveTo(tailBaseX, tailBaseY);
  ctx.quadraticCurveTo(
    tailBaseX - 22 + tailSway, tailBaseY + 6,
    tailBaseX - 30 + tailSway * 1.3, tailBaseY - 28
  );
  ctx.stroke();
  ctx.restore();
}

function drawPaws() {
  if (player.isJumping) {
    return;
  }
  const runFrame = Math.floor(performance.now() / 150) % 2;
  const legOffset = runFrame === 0 ? 0 : 4;
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.roundRect(player.x + 6 + legOffset, player.y + player.height - 4, 7, 5, 2);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(player.x + player.width - 13 - legOffset, player.y + player.height - 4, 7, 5, 2);
  ctx.fill();
}

function drawBody() {
  const earSize = 13;

  ctx.save();
  ctx.shadowColor = player.color;
  ctx.shadowBlur = 18;
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.roundRect(player.x, player.y, player.width, player.height, player.width * 0.4);
  ctx.fill();

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
}

function drawWhiskers() {
  const whiskerY = player.y + player.height * 0.5;
  const leftBaseX = player.x + player.width * 0.05;
  const rightBaseX = player.x + player.width * 0.95;

  ctx.strokeStyle = 'rgba(245, 245, 255, 0.6)';
  ctx.lineWidth = 0.8;

  [-4, 0, 4].forEach((offset) => {
    ctx.beginPath();
    ctx.moveTo(leftBaseX, whiskerY + offset * 0.5);
    ctx.lineTo(leftBaseX - 11, whiskerY + offset);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(rightBaseX, whiskerY + offset * 0.5);
    ctx.lineTo(rightBaseX + 11, whiskerY + offset);
    ctx.stroke();
  });
}

function drawFace() {
  ctx.fillStyle = 'rgba(255, 170, 200, 0.6)';
  const cheekY = player.y + player.height * 0.62;
  ctx.beginPath();
  ctx.arc(player.x + player.width * 0.14, cheekY, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(player.x + player.width * 0.86, cheekY, 5, 0, Math.PI * 2);
  ctx.fill();

  const expression = getExpression();
  const eyeY = player.y + player.height * 0.36;
  const eyeSize = 9;
  const leftEyeX = player.x + player.width * 0.14;
  const rightEyeX = player.x + player.width * 0.68;

  ctx.fillStyle = '#0b0b1a';
  ctx.strokeStyle = '#0b0b1a';
  ctx.lineWidth = 2;

  if (expression === 'blink') {
    ctx.beginPath();
    ctx.moveTo(leftEyeX, eyeY + eyeSize / 2);
    ctx.lineTo(leftEyeX + eyeSize, eyeY + eyeSize / 2);
    ctx.moveTo(rightEyeX, eyeY + eyeSize / 2);
    ctx.lineTo(rightEyeX + eyeSize, eyeY + eyeSize / 2);
    ctx.stroke();
  } else if (expression === 'happy') {
    ctx.beginPath();
    ctx.arc(leftEyeX + eyeSize / 2, eyeY + eyeSize / 2, eyeSize / 2, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(rightEyeX + eyeSize / 2, eyeY + eyeSize / 2, eyeSize / 2, Math.PI, Math.PI * 2);
    ctx.stroke();
  } else if (expression === 'jumping') {
    ctx.fillRect(leftEyeX, eyeY + 2, eyeSize, eyeSize - 4);
    ctx.fillRect(rightEyeX, eyeY + 2, eyeSize, eyeSize - 4);
    ctx.beginPath();
    ctx.moveTo(leftEyeX - 1, eyeY - 2);
    ctx.lineTo(leftEyeX + eyeSize + 1, eyeY - 4);
    ctx.moveTo(rightEyeX - 1, eyeY - 4);
    ctx.lineTo(rightEyeX + eyeSize + 1, eyeY - 2);
    ctx.stroke();
  } else {
    ctx.fillRect(leftEyeX, eyeY, eyeSize, eyeSize);
    ctx.fillRect(rightEyeX, eyeY, eyeSize, eyeSize);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(leftEyeX + 1, eyeY + 1, 2, 2);
    ctx.fillRect(rightEyeX + 1, eyeY + 1, 2, 2);
  }

  ctx.fillStyle = COLOR_MAGENTA;
  ctx.fillRect(player.x + player.width * 0.47, player.y + player.height * 0.53, 4, 3);

  drawMouth(expression);
}

function drawMouth(expression) {
  const mouthX = player.x + player.width / 2;
  const mouthY = player.y + player.height * 0.78;

  ctx.strokeStyle = '#0b0b1a';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  if (expression === 'jumping') {
    ctx.beginPath();
    ctx.moveTo(mouthX - 2, mouthY);
    ctx.lineTo(mouthX + 2, mouthY);
    ctx.stroke();
    return;
  }

  const mouthRadius = expression === 'happy' ? 6 : 4;
  ctx.beginPath();
  ctx.arc(mouthX, mouthY, mouthRadius, 0, Math.PI);
  ctx.stroke();
}

function drawPlayer() {
  const t = squashTimer > 0 ? 1 - squashTimer / SQUASH_DURATION : 0;
  const amount = squashTimer > 0 ? Math.sin(t * Math.PI) : 0;
  const scaleY = squashMode === 'land' ? 1 - amount * 0.18 : 1 + amount * 0.15;
  const scaleX = squashMode === 'land' ? 1 + amount * 0.12 : 1 - amount * 0.1;
  const pivotX = player.x + player.width / 2;
  const pivotY = player.y + player.height;

  ctx.save();
  ctx.translate(pivotX, pivotY);
  ctx.scale(scaleX, scaleY);
  ctx.translate(-pivotX, -pivotY);

  drawTail();
  drawPaws();
  drawBody();
  drawWhiskers();
  drawFace();

  ctx.restore();
}

function drawHud() {
  ctx.textAlign = 'left';
  ctx.fillStyle = COLOR_CYAN;
  ctx.font = '18px Orbitron, sans-serif';
  ctx.fillText('LEVEL ' + level, 20, 28);
  ctx.fillText('SCORE: ' + score, 20, 52);
  ctx.fillText('HIGH SCORE: ' + highScore, 20, 76);

  if (comboCount > 0) {
    ctx.fillStyle = COLOR_MAGENTA;
    ctx.fillText('COMBO x' + comboCount, 20, 100);
  }
}

function drawNiceTexts() {
  niceTexts.forEach((t) => {
    const progress = 1 - t.life / t.maxLife;
    const alpha = t.life / t.maxLife;
    const y = t.y - progress * 20;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.textAlign = 'center';
    ctx.shadowColor = COLOR_CYAN;
    ctx.shadowBlur = 10;
    ctx.fillStyle = COLOR_CYAN;
    ctx.font = '16px Orbitron, sans-serif';
    ctx.fillText('NICE!', t.x, y);
    ctx.fillText('+' + t.bonus, t.x, y + 16);
    ctx.restore();
  });
}

function drawComboPopup() {
  if (comboPopupTimer <= 0 || comboCount < 2) {
    return;
  }
  const alpha = Math.min(1, comboPopupTimer / 30);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.textAlign = 'center';
  ctx.shadowColor = COLOR_MAGENTA;
  ctx.shadowBlur = 16;
  ctx.fillStyle = COLOR_MAGENTA;
  ctx.font = '26px Orbitron, sans-serif';
  ctx.fillText('COMBO x' + comboCount, canvas.width / 2, 70);
  ctx.restore();
}

function drawLevelUpRing() {
  if (levelUpTimer <= 0) {
    return;
  }
  const progress = 1 - levelUpTimer / LEVEL_UP_DURATION;
  const radius = progress * RING_MAX_RADIUS;
  const alpha = 1 - progress;
  const cx = player.x + player.width / 2;
  const cy = player.y + player.height / 2;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = COLOR_PURPLE;
  ctx.shadowColor = COLOR_PURPLE;
  ctx.shadowBlur = 10;
  for (let i = 0; i < RING_PARTICLE_COUNT; i++) {
    const angle = (Math.PI * 2 * i) / RING_PARTICLE_COUNT;
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawMilestone() {
  if (milestoneTimer <= 0) {
    return;
  }
  const alpha = Math.min(1, milestoneTimer / 20);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowColor = COLOR_CYAN;
  ctx.shadowBlur = 22;
  drawCenteredText('MILESTONE!', canvas.height / 2 - 20, 32);
  drawCenteredText(milestoneScore + ' SCORE', canvas.height / 2 + 16, 22);
  ctx.restore();
}

function drawCenteredText(text, y, size) {
  ctx.textAlign = 'center';
  ctx.fillStyle = COLOR_CYAN;
  ctx.font = size + 'px Orbitron, sans-serif';
  ctx.fillText(text, canvas.width / 2, y);
}

function render() {
  drawBackground();
  drawLevelUpGlow();
  drawStars();
  drawShootingStars();
  drawMoon();
  drawCity();
  drawHolograms();
  drawHorizon();
  drawGrid();
  drawGround();
  drawObstacle();
  drawTrail();
  drawParticles();
  drawNiceTexts();
  drawPlayer();
  drawLevelUpRing();
  drawHud();
  drawComboPopup();

  if (gameState === 'title') {
    ctx.save();
    ctx.shadowColor = COLOR_CYAN;
    ctx.shadowBlur = 20;
    drawCenteredText('NEON NEKO RUNNER', canvas.height / 2 - 40, 38);
    ctx.restore();
    drawCenteredText('SPACE TO START', canvas.height / 2 + 20, 22);
  } else if (gameState === 'gameover') {
    const blinkOn = Math.floor(performance.now() / 400) % 2 === 0;
    if (blinkOn) {
      drawCenteredText('GAME OVER', canvas.height / 2 - 20, 34);
    }
    drawCenteredText('SPACE TO RESTART', canvas.height / 2 + 25, 20);
  }

  if (levelUpTimer > 0 && milestoneTimer <= 0) {
    const blinkOn = Math.floor(performance.now() / 200) % 2 === 0;
    if (blinkOn) {
      drawCenteredText('LEVEL UP!', canvas.height / 2 - 20, 30);
      drawCenteredText('LEVEL ' + level, canvas.height / 2 + 14, 22);
    }
  }

  drawMilestone();

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
