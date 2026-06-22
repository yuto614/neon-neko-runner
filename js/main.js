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
};

function update() {
}

function render() {
  ctx.fillStyle = '#222222';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = ground.color;
  ctx.fillRect(ground.x, ground.y, ground.width, ground.height);

  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
