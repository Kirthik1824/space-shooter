//game 

const canvas=document.getElementById('gamecanvas');
const ctx=canvas.getContext('2d');

canvas.width=window.innerWidth;
canvas.height=window.innerHeight;

const playerBaseImg= new Image();
playerBaseImg.src='./assets/space-turret.png';

const enemyShipImg = new Image();
enemyShipImg.src='./assets/enemy.png';

let mouseX=0;
let mouseY=0;

canvas.addEventListener('mousemove',(event)=>{
    const rect=canvas.getBoundingClientRect();
    mouseX=event.clientX-rect.left;
    mouseY=event.clientY-rect.top;
});

const playerBase = {
    x:canvas.width/2,
    y:canvas.height/2,
    width:100,
    height:100,
    color:"green",
};

//Get turret angle 

function getTurretAngle() {
    const dx = mouseX - playerBase.x;
    const dy = mouseY - playerBase.y;
    const angle = Math.atan2(dy, dx); // Calculate angle in radians
  
    //console.log(`Turret Angle (Radians): ${angle}, Degrees: ${(angle * 180) / Math.PI}`);
    return angle;
  }

function drawPlayerBase(){

    const angle=getTurretAngle();

    ctx.save();

    ctx.translate(playerBase.x,playerBase.y);
    ctx.rotate(angle);

    ctx.drawImage(playerBaseImg,-playerBase.width/2,-playerBase.height/2,playerBase.width,playerBase.height);

    ctx.restore();
}

let bullets=[];
let enemies=[];
let level=1;
let gameOver=false;
let score=0;

//Bullet Class

class bullet{

    constructor(x,y,angle){
        this.x=x;
        this.y=y;
        this.width=5;
        this.height=10;
        this.angle=angle;
        this.speed=5;
    }

    update (){
        this.x+=this.speed*Math.cos(this.angle);
        this.y+=this.speed*Math.sin(this.angle);
    }

    draw(){
        ctx.fillStyle='red';
        ctx.fillRect(this.x,this.y,this.width,this.height);
    }
}

//Enemy Class

class Enemy{
    constructor (x,y,speed) {
        this.x=x;
        this.y=y;
        this.width=50;
        this.height=50;
        this.speed=speed;
    }

    update(){
        let angle=Math.atan2(playerBase.y-this.y,playerBase.x-this.x);
        this.x+=this.speed*Math.cos(angle);
        this.y+=this.speed*Math.sin(angle);
    }

    draw(){
        ctx.drawImage(enemyShipImg, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }
}

//Mouse Click to fire

canvas.addEventListener("click",function(e){
    let angle=Math.atan2(e.clientY-playerBase.y, e.clientX-playerBase.x);
    bullets.push(new bullet(playerBase.x,playerBase.y, angle));
});

//Spawn enemies

function spawnEnemies(){
    for(let i=0;i<level*3;i++){
        let side=Math.floor(Math.random()*4);
        let x,y;
        let speed=level*0.1+0.5;

        if(side==0){
            x=Math.random()*canvas.width;
            y=0;
        }
        else if(side==1){
            x=canvas.width;
            y=Math.random()*canvas.height;
        }
        else if(side==2){
            x = Math.random() * canvas.width;
            y = canvas.height;
        }
        else {
            x=0;
            y=Math.random()*canvas.height;
        }

        enemies.push(new Enemy(x,y,speed));
    }
}

//Bullet collision 

function checkBulletCollision(){
    bullets.forEach((bullet,bulletIndex)=>{
        enemies.forEach((enemy,enemyIndex)=>{
            if( 
                bullet.x<enemy.x+enemy.width && 
                bullet.x+bullet.width>enemy.x &&
                bullet.y <enemy.y+enemy.height &&
                bullet.y +bullet.height > enemy.y 
            ){
                //Bullet hits
                bullets.splice(bulletIndex,1);
                enemies.splice(enemyIndex,1);
                score+=10;
            }
        })
    });
}

//Game Over

function displayGameOver(){
    ctx.fillStyle='white';
    ctx.font='30px Arial';
    ctx.fillText("Game Over!",canvas.width/2-90,canvas.height/2);
    ctx.fillText("Press 'R' to restart", canvas.width/2-120, canvas.height/2+40);   
}

document.addEventListener('keydown',function(e){
    if(e.key=='r'||e.key=='R'){
        if(gameOver){
            resetGame();
        }
    }
});

function resetGame(){
    gameOver=false;
    level=1;
    bullets=[];
    enemies=[];
    spawnEnemies();
    gameLoop();
}

//Check level completion 

function checkLevelCompletion(){
    if(enemies.length==0){
        level++;
        spawnEnemies();
    }
}

//Score

function displayScore(){
    ctx.fillStyle='white';
    ctx.font='24px Arial';
    ctx.fillText('Score: '+ score,20,40);
}

// Game Loop

function gameLoop(){
    if(gameOver) {
        displayGameOver();
        score=0;
        return;
    }

    ctx.clearRect(0,0,canvas.width,canvas.height);

    //Player Base 
    //Image

    drawPlayerBase();

    //Player Base Rectangle
    //ctx.fillStyle=playerBase.color;
    //ctx.fillRect(playerBase.x-playerBase.width/2,playerBase.y-playerBase.height/2,playerBase.width,playerBase.height);

    //Update and draw Bullets

    bullets.forEach((bullet,index)=>{
        bullet.update();
        bullet.draw();

        if(bullet.x<0||bullet.x>canvas.width||bullet.y<0||bullet.y>canvas.height){
            bullets.splice(index,1);
        }
    });

    //Bullet collision
    checkBulletCollision();

    //Update and draw enemies

    enemies.forEach((enemy,index)=>{
        enemy.update();
        enemy.draw();

        if(Math.abs(enemy.x-playerBase.x)<playerBase.width/2 && Math.abs(enemy.y-playerBase.y)<playerBase.height/2){
            gameOver=true;
            //alert('Game Over!');
        }
    });

    checkLevelCompletion();

    displayScore();

    requestAnimationFrame(gameLoop);

}

function startGame(){
    document.getElementById('instructions').style.display='none';
    spawnEnemies();
    gameLoop();
}

document.getElementById('startBtn').addEventListener('click',startGame);

spawnEnemies();
