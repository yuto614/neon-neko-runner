const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const HIGH_SCORE_KEY = 'cat-game-high-score';

const ground = {
  x: 0,
  y: 410,
  width: 800,
  height: 40,
  color: '#2e1a47',
};

const player = {
  x: 60,
  y: 370,
  width: 40,
  height: 40,
  color: '#00f6ff',
  vy: 0,
  isJumping: false,
};

const obstacle = {
  x: 750,
  y: 370,
  width: 30,
  height: 40,
  color: '#ff2d95',
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

let gameState = 'title';
let score = 0;
let highScore = Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0;
let obstacleSpeed = BASE_OBSTACLE_SPEED;

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

function drawGround() {
  ctx.fillStyle = ground.color;
  ctx.fillRect(ground.x, ground.y, ground.width, ground.height);
}

function drawObstacle() {
  ctx.save();
  ctx.shadowColor = obstacle.color;
  ctx.shadowBlur = 12;
  ctx.fillStyle = obstacle.color;
  ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  ctx.restore();
}

function drawPlayer() {
  ctx.save();
  ctx.shadowColor = player.color;
  ctx.shadowBlur = 15;
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  const earSize = 10;
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
  ctx.fillRect(player.x + player.width * 0.22, eyeY, 4, 4);
  ctx.fillRect(player.x + player.width * 0.66, eyeY, 4, 4);

  ctx.fillStyle = '#ff2d95';
  ctx.fillRect(player.x + player.width * 0.46, player.y + player.height * 0.55, 4, 3);
}

function drawScore() {
  ctx.textAlign = 'left';
  ctx.fillStyle = '#00f6ff';
  ctx.font = '18px Orbitron, sans-serif';
  ctx.fillText('SCORE: ' + score, 14, 26);
  ctx.fillText('HIGH SCORE: ' + highScore, 14, 48);
}

function drawCenteredText(text, y, size) {
  ctx.textAlign = 'center';
  ctx.fillStyle = '#00f6ff';
  ctx.font = size + 'px Orbitron, sans-serif';
  ctx.fillText(text, canvas.width / 2, y);
}

function render() {
  drawBackground();
  drawGround();
  drawObstacle();
  drawPlayer();
  drawScore();

  if (gameState === 'title') {
    drawCenteredText('SPACE TO START', canvas.height / 2, 28);
  } else if (gameState === 'gameover') {
    drawCenteredText('GAME OVER', canvas.height / 2 - 15, 32);
    drawCenteredText('SPACE TO RESTART', canvas.height / 2 + 20, 20);
  }
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
