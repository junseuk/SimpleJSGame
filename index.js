const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
canvas.width = innerWidth
canvas.height = innerHeight

const score = document.querySelector('#score');
const score2 = document.querySelector('#score2');
const startGameBtn = document.querySelector('#start-game-btn');
const modal = document.querySelector('#modal');

class Player {
  constructor(x, y , radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.closePath();
  }
}

const x = innerWidth / 2;
const y = innerHeight / 2;
class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.closePath();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}
class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.closePath();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

const friction = 0.97;
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }

  draw() {
    c.save();
    c.globalAlpha = this.alpha;
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.restore();
  }

  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
  }
}

function spawnEnemy() {
  setInterval(() => {
    //Max size = 30, Min size = 4
    const radius = Math.random() * (30 - 4) + 4;
    let x;
    let y;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    }
    else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }
    const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle)
    }
    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 1000)
}

let player = new  Player(x, y, 15, 'white');
let projectiles = [];
let enemies = [];
let particles = [];
let _score = 0;

function init() {
  player = new  Player(x, y, 15, 'white');
  projectiles = [];
  enemies = [];
  particles = [];
  _score = 0;
  score.innerHTML = _score;
  score2.innerHTML = _score;
}

let animationId;
function animate() {
  animationId = requestAnimationFrame(animate);
  c.fillStyle = 'rgba(0, 0, 0, 0.1)';
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.draw();

  projectiles.forEach((projectile, index) => {
    projectile.update();
    //remove projectile if it goes off screen
    if (projectile.x + projectile.radius < 0 ||
        projectile.x - projectile.radius > canvas.width ||
        projectile.y + projectile.radius < 0 ||
        projectile.y - projectile.radius > canvas.height) {
      setTimeout(() => {
        projectiles.splice(index, 1);
      }, 0)
    }
  });

  enemies.forEach((enemy, index) => {
    enemy.update();
    const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (distance - enemy.radius - player.radius < 0) {
      cancelAnimationFrame(animationId);
      modal.style.display = 'flex';
      score2.innerHTML = _score;
    }
    projectiles.forEach((projectile, projectileIndex) => {
      const distance = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
      if (distance - enemy.radius - projectile.radius < 0) {
        //when projectile hits enemy
        //create explosions
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(new Particle(
            projectile.x, 
            projectile.y,
            Math.random() * 2, 
            enemy.color, 
            {
              x: (Math.random() - 0.5) * (Math.random() * 8), 
              y: (Math.random() - 0.5) * (Math.random() * 8)
            }
          ));
        }
        if (enemy.radius - 10 > 10) {
          //increase score
          _score += 100;
          score.innerHTML = _score;
          gsap.to(enemy, {
            radius: enemy.radius - 10
          });
          setTimeout(() => {
            projectiles.splice(projectileIndex, 1);
          }, 0)
        }
        else {
          //increase score with bonus
          _score += 250;
          score.innerHTML = _score;
          setTimeout(()=> {
            enemies.splice(index, 1);
            projectiles.splice(projectileIndex, 1);
          }, 0)
        }
      };
    });
  });

  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    } else {
      particle.update();
    }
  });
};

addEventListener('click', (e) => {
  const angle = Math.atan2(e.clientY - canvas.height / 2, e.clientX - canvas.width / 2);
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5
  }
  projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity));
})

startGameBtn.addEventListener('click', () => {
  init();
  modal.style.display = 'none';
  animate();
  spawnEnemy();
});
