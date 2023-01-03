
const canvas = document.querySelector('canvas');

const c = canvas.getContext('2d');

const scoreDisplay = document.querySelector('#score_display');
const scoreBox = document.querySelector('#score_box');
const scoreFinal = document.querySelector('#score_final');
const startGameBtn = document.querySelector('#start_game');

canvas.width = innerWidth; /*******************************************set canvas width and height */
canvas.height = innerHeight;

class Player {  /***********************************************player constructor */
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;

        this.radius = radius;
        this.color = color;
    }

    draw() {  /*********************draw player function */
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        c.fillStyle = this.color;
        c.fill();
    }
}

class Bullet {  /**********************************************Bullet constructor */
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;

        this.radius = radius;
        this.color = color;

        this.velocity = velocity;
    }

    draw() {  /*********************draw Bullet function */
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    update() { /*********************update Bullet function*/
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}
class Enemy {  /**********************************************Enemy constructor */
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;

        this.radius = radius;
        this.color = color;

        this.velocity = velocity;
    }

    draw() {  /*********************draw Enemy function */
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    update() { /*********************update Enemy function*/
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

const friction = 0.97;

class Particle {  /**********************************************bullet fx constructor */
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;

        this.radius = radius;
        this.color = color;

        this.velocity = velocity;
        this.alpha = 1;
    }

    draw() {  /*********************draw bullet fx function */
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        c.fillStyle = this.color;
        c.fill();
        c.restore();
    }

    update() { /*********************update bullet fx function*/
        this.draw();
        this.velocity.x *=  friction;
        this.velocity.y *=  friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    }
}

const x = canvas.width / 2;  /**********Set position to canvas center */
const y = canvas.height / 2;

let player = new Player(x, y, 30, 'white');  /*****************Create player */
let bullets = [];
let enemies = [];
let particles = [];

function init() {
    player = new Player(x, y, 30, 'white');  /*****************Create player */
    bullets = [];
    enemies = [];
    particles = [];
    score = 0;
    scoreDisplay.innerHTML = score;
    scoreFinal.innerHTML = score;
}


function spawnEnemies() {
    setInterval(()=>{ 
        const radius = Math.random() * (40 - 8) + 8;

        let x;
        let y;

        if(Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0-radius : canvas.width+radius;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0-radius : canvas.height+radius;
        }
        

        const color = `hsl(${Math.random() * 360}, 50%, 50%`;
        
        const angle = Math.atan2(
            canvas.height / 2 - y, 
            canvas.width / 2 - x
            )
        
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        enemies.push(new Enemy(x, y, radius, color, velocity));
        console.log(enemies);
    }, 1000);
}

let animationId;
let score = 0;

function animate() {
    animationId = requestAnimationFrame(animate);
    
    c.fillStyle = 'rgba(0, 0, 0, 0.1)';
    c.fillRect(0, 0, canvas.width, canvas.height);

    player.draw();  /*********************************************************************Draw player */
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1);
        }else {
            particle.update();
        };
    });
    bullets.forEach((bullet, index) => {
        bullet.update();

        if (bullet.x + bullet.radius < 0 || 
            bullet.x - bullet.radius > canvas.width ||
            bullet.y + bullet.radius < 0 ||
            bullet.y - bullet.radius > canvas.height
            ) {
            setTimeout(() => {
                bullets.splice(index, 1);
            }, 0);
        }
    });
    

    enemies.forEach((enemy, index) => {
        enemy.update();

        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

        if (dist - enemy.radius - player.radius < 1)  {
            cancelAnimationFrame(animationId);
            scoreFinal.innerHTML = score;
            scoreBox.style.display = 'flex';
        }

        bullets.forEach((bullet, bulletIndex) => {
            const dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
            
            if (dist - enemy.radius - bullet.radius < 1) {/*********When bullet hits enemy */

                

                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(
                        new Particle(bullet.x, bullet.y, Math.random() * 2, enemy.color, 
                            {
                            x: (Math.random()-0.5) * (Math.random() * 6), 
                            y: (Math.random()-0.5) * (Math.random() * 6) 
                        }))
                };

                if(enemy.radius - 10 > 6) {

                    score += 100;
                    scoreDisplay.innerHTML = score;

                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    setTimeout(() => {
                        bullets.splice(bulletIndex, 1);
                    }, 0);
                }else{
                    setTimeout(() => {
                        score += 250;
                        scoreDisplay.innerHTML = score;
                        enemies.splice(index, 1);
                        bullets.splice(bulletIndex, 1);
                    }, 0);
                }
                
            };
        });
    });
};

window.addEventListener('click', (event) => {     /***************Create bullet */
    const angle = Math.atan2(
        event.clientY - canvas.height / 2, 
        event.clientX - canvas.width / 2
        )
    
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }

    bullets.push(new Bullet(
        canvas.width/2, 
        canvas.height/2, 
        5, 
        'white', 
        velocity
    ))
    
});

startGameBtn.addEventListener('click', () => {
    init()
    animate();
    spawnEnemies();
    scoreBox.style.display = 'none';
})
