/*
** html elements
*/
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
canvas.width = innerWidth;
canvas.height = innerHeight;
const x = innerWidth / 2;
const y = innerHeight / 2;
const score = document.querySelector('#score');
const score2 = document.querySelector('#score2');
const startGameBtn = document.querySelector('#start-game-btn');
const modal = document.querySelector('#modal');
const upgradeModal = document.querySelector('#upgrade-modal');
const PowerUpgradeBtn = document.querySelector("#upgrade-power");
const SpeedUpgradeBtn = document.querySelector("#upgrade-speed");
const NumProjectileUpgradeBtn = document.querySelector("#upgrade-num-projectile");

/*
** sound effects section
*/
const buttonAudio = new Audio('button.mp3');
const upgradeAudio = new Audio('upgrade.mp3');
const backgroundAudio = new Audio('background.mp3');
buttonAudio.volume = 0.2;
upgradeAudio.volume = 0.4;
backgroundAudio.volume = 0.6;

/*
** upgrade stats
*/
let powerLvl = 0;
let speedLvl = 0.4;
let numProjectileLvl = 500;

/*
** Player
*/
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

/*
** Boss
*/
class Boss {
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

/*
** Projectile
*/
class Projectile {
  constructor(x, y, radius, velocity, speed, power) {
    this.x = x;
    this.y = y;
    this.velocity = velocity;
    this.speed = speed;
    this.power = power;
    if (this.power + radius >= 20) this.radius = 20
    else this.radius = radius + this.power;
  }
  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = `rgba(255, ${255 - this.power * 15}, ${255 - this.power * 15}, 1)`;
    c.fill();
    c.closePath();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x * this.speed;
    this.y = this.y + this.velocity.y * this.speed;
  }
}
/*
** shooting projectiles
*/
let shootingInterval;
let mouseX;
let mouseY;
const shootingIntervalFunc = () => {
  console.log("hi");
  shootingInterval = setInterval(() => {
    console.log("shoot!")
    onmousemove = function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    };

    const angle = Math.atan2(
        mouseY - canvas.height / 2,
        mouseX - canvas.width / 2
    );
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5,
    };
    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, velocity, speedLvl, powerLvl));
  }, numProjectileLvl);
};

/*
** Enemy
*/
let enemySpeed = 0.5;
class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.speed = enemySpeed + (Math.random() * 0.4 - 0.2);
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

    if (up)    gsap.to(this, { y: this.y + this.velocity.y + playerVelocity, ease: "power3", duration: 0 });
    if (right) gsap.to(this, { x: this.x + this.velocity.x - playerVelocity, ease: "power3", duration: 0 });
    if (down)  gsap.to(this, { y: this.y + this.velocity.y - playerVelocity, ease: "power3", duration: 0 });
    if (left)  gsap.to(this, { x: this.x + this.velocity.x + playerVelocity, ease: "power3", duration: 0 });
  }
}

function spawning() {
  console.log(animationId);
  let maxSize = 30;
  let minSize = 15;
  const radius = Math.random() * (maxSize - minSize) + minSize;
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
  setTimeout(spawning, spawnInterval);
}

function spawnEnemy() {
  console.log("spawning enemy");
  setTimeout(spawning, spawnInterval)
}

let up;
let down;
let left;
let right;
function move(){
  up = false;
  down = false;
  left = false;
  right = false;

  document.addEventListener('keydown',(e) => {
    if (e.keyCode === 87 /* w */) up = true
    if (e.keyCode === 68 /* d */) right = true
    if (e.keyCode === 83 /* s */) down = true
    if (e.keyCode === 65 /* a */) left = true
  });

  document.addEventListener('keyup',(e) => {
    if (e.keyCode === 87 /* w */) up = false
    if (e.keyCode === 68 /* d */) right = false
    if (e.keyCode === 83 /* s */) down = false
    if (e.keyCode === 65 /* a */) left = false
  });
}

/*
** Particle
*/
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

/*
** initialization
*/
let player = new  Player(x, y, 15, 'white');
let projectiles = [];
let enemies = [];
let particles = [];
let _score = 0;
let upgrade = false;
let upgradeCount = 0;
let bossCount = 0;
let spawnInterval = 5000;
let minSpawnInterval = 800;
let playerVelocity = 0.5;
let upgradeInterval = 2;
const levelParam = 0.8;

function init() {
  player = new  Player(x, y, 15, 'white');
  projectiles = [];
  enemies = [];
  particles = [];
  spawnInterval = 5000;
  enemySpeed = 0.5;
  bossCount = 0;
  upgradeCount = 0;
  upgrade = false;
  _score = 0;
  score.innerHTML = _score;
  score2.innerHTML = _score;
  powerLvl = 0;
  speedLvl = 0.4;
  numProjectileLvl = 500;
  playerVelocity = 0.5;
}

/*
** animation loop
*/
let animationId;
function animate() {
  if (upgradeCount != 0 && upgradeCount % upgradeInterval == 0) {
    console.log("upgrade init");
    upgradeCount = 0;
    bossCount++;
    upgrade = true;
  }
  //Stop animation for upgrade phase
  if (upgrade) {
    console.log("upgrading");
    cancelAnimationFrame(animationId);
    clearInterval(shootingInterval);
    upgradeModal.style.display = 'flex';
  }
  else {
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
          if (enemy.radius - (10 + powerLvl) > 10) {
            //increase score
            _score += 10;
            score.innerHTML = _score;
            gsap.to(enemy, {
              radius: enemy.radius - (10 + powerLvl)
            });
            setTimeout(() => {
              projectiles.splice(projectileIndex, 1);
            }, 0)
          }
          else {
            //increase score with bonus
            _score += 25;
            score.innerHTML = _score;
            upgradeCount++;
            console.log("kill: " + upgradeCount);
            //increase level
            if (spawnInterval > minSpawnInterval) {
              spawnInterval *= levelParam;
              enemySpeed += 0.05;
              console.log(enemySpeed);
            }
            //next stage
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
  }
};

/*
** event listeners
*/
startGameBtn.addEventListener('click', () => {
  backgroundAudio.play();
  buttonAudio.play();
  init();
  modal.style.display = 'none';
  animate();
  spawnEnemy();
  shootingIntervalFunc();
  move();
});

PowerUpgradeBtn.addEventListener('click', () => {
  console.log("Power Upgrade");
  upgradeAudio.play();
  upgrade = false;
  upgradeModal.style.display = 'none';
  powerLvl += 5;
  console.log("powerLvl: " + powerLvl);
  
  animate();
  shootingIntervalFunc();
});

SpeedUpgradeBtn.addEventListener('click', () => {
  console.log("Speed Upgrade");
  upgradeAudio.play();
  upgrade = false;
  upgradeModal.style.display = 'none';
  speedLvl += 0.3;
  console.log("Speed: " + speedLvl);
  animate();
  shootingIntervalFunc();
});

NumProjectileUpgradeBtn.addEventListener('click', () => {
  console.log("Range Upgrade");
  upgradeAudio.play();
  upgrade = false;
  upgradeModal.style.display = 'none';
  numProjectileLvl -= 100;
  console.log("numProjectile: " + numProjectileLvl);
  animate();
  shootingIntervalFunc();
});