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
  x: 800,
  y: 370,
  width: 30,
  height: 40,
  color: '#c0392b',
};

const GRAVITY = 0.6;
const JUMP_STRENGTH = -12;
const OBSTACLE_SPEED = 4;
const groundY = ground.y - player.height;

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !player.isJumping) {
    e.preventDefault();
    player.vy = JUMP_STRENGTH;
    player.isJumping = true;
  }
});

function update() {
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
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
