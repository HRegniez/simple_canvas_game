console.log(gsap)
const canvas = document.querySelector('canvas');

const c = canvas.getContext('2d');

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

const x = canvas.width / 2;  /**********Set position to canvas center */
const y = canvas.height / 2;

const player = new Player(x, y, 30, 'white');  /*****************Create player */




const bullets = [];
const enemies = [];

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

function animate() {
    animationId = requestAnimationFrame(animate);
    
    c.fillStyle = 'rgba(0, 0, 0, 0.1)';
    c.fillRect(0, 0, canvas.width, canvas.height);

    player.draw();  /*********************************************************************Draw player */
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
        }

        bullets.forEach((bullet, bulletIndex) => {
            const dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
            
            if (dist - enemy.radius - bullet.radius < 1) {/*********When bullet hits enemy */
                if(enemy.radius - 10 > 6) {
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    setTimeout(() => {
                        bullets.splice(bulletIndex, 1);
                    }, 0);
                }else{
                    setTimeout(() => {
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

animate();
spawnEnemies();