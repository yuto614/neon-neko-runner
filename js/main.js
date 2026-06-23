const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const ground = {
  x: 0,
  y: 410,
  width: 800,
  height: 40,
  color: '#5a8f3c',
};

const player = {
  x: 60,
  y: 370,
  width: 40,
  height: 40,
  color: '#f5a623',
  vy: 0,
  isJumping: false,
};

const obstacle = {
  x: 750,
  y: 370,
  width: 30,
  height: 40,
  color: '#c0392b',
};

const GRAVITY = 0.6;
const JUMP_STRENGTH = -12;
const OBSTACLE_SPEED = 4;
const groundY = ground.y - player.height;

let gameOver = false;
let score = 0;

function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function resetGame() {
  player.x = 60;
  player.y = groundY;
  player.vy = 0;
  player.isJumping = false;

  obstacle.x = 750;

  gameOver = false;
  score = 0;
}

window.addEventListener('keydown', (e) => {
  if (e.code !== 'Space') {
    return;
  }
  e.preventDefault();

  if (gameOver) {
    resetGame();
    return;
  }

  if (!player.isJumping) {
    player.vy = JUMP_STRENGTH;
    player.isJumping = true;
  }
});

function update() {
  if (gameOver) {
    return;
  }

  player.vy += GRAVITY;
  player.y += player.vy;

  if (player.y >= groundY) {
    player.y = groundY;
    player.vy = 0;
    player.isJumping = false;
  }

  obstacle.x -= OBSTACLE_SPEED;
  if (obstacle.x + obstacle.width < 0) {
    obstacle.x = canvas.width;
  }

  if (isColliding(player, obstacle)) {
    gameOver = true;
    return;
  }

  score += 1;
}

function render() {
  ctx.fillStyle = '#222222';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = ground.color;
  ctx.fillRect(ground.x, ground.y, ground.width, ground.height);

  ctx.fillStyle = obstacle.color;
  ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  ctx.fillStyle = '#ffffff';
  ctx.font = '20px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Score: ' + score, 10, 30);

  if (gameOver) {
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, 60);
  }
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
