let canvas, ctx;
let width = 600, height = 150;

let spritesheet = document.getElementById("spritesheet");

let score = 0, high_score = localStorage.getItem("hi") || 0, scoreTime = 5; scoreCounter = 0;
let time = 0, startSpeed = 5, speed = startSpeed, topSpeed = 12;
let floor_x = 0;
let grav = 0.5;

let spawnTime = 100, spawnCounter = 0;
    
let player = {
    x: 40,
    y: 95,
    vy: 0,
    crouch: false,
    hitbox: {
        x: 10,
        y: 5,
        w: 20,
        h: 35
    },
    hb_stand: {
        x: 10,
        y: 5,
        w: 20,
        h: 35
    },
    hb_crouch: {
        x: 10,
        y: 25,
        w: 40,
        h: 15
    },
    update: function () {
        this.vy += grav;
        this.y += this.vy;
        if (this.y > 95) this.y = 95;
    },
    render: function () {
        if (!this.crouch) ctx.drawImage(spritesheet, 936, 2, 44, 47, this.x, this.y, 44, 47);
        else ctx.drawImage(spritesheet, 1112, 2, 59, 47, this.x, this.y, 59, 47);
    },
    jump: function () {
        if (player.y == 95) this.vy = -9;
    },
    do_crouch: function (b) {
        this.crouch = b;
        this.hitbox = !b ? this.hb_stand : this.hb_crouch;
    },
    getHitbox: function () {
        return {x: this.x + this.hitbox.x, y: this.y + this.hitbox.y, w: this.hitbox.w, h: this.hitbox.h};
    }
};

let obstacles = [
    {sx: 228, sy: 2, sw: 17, sh: 35},
    {sx: 245, sy: 2, sw: 17, sh: 35},
    {sx: 263, sy: 2, sw: 17, sh: 35},
    {sx: 279, sy: 2, sw: 17, sh: 35},
    {sx: 296, sy: 2, sw: 17, sh: 35},
    {sx: 313, sy: 2, sw: 17, sh: 35},
    {sx: 332, sy: 2, sw: 25, sh: 51},
    {sx: 357, sy: 2, sw: 25, sh: 51},
    {sx: 382, sy: 2, sw: 25, sh: 51},
    {sx: 407, sy: 2, sw: 25, sh: 51},
    {sx: 431, sy: 2, sw: 51, sh: 51},
];

let current_obstacles = [];
    

function start() {
    init();
    window.requestAnimationFrame(loop);
}

function init() {
    canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.style.transformOrigin = "top left";
    canvas.style.margin = "0";
    rescale();
    canvas.style.imageRendering = "pixelated";
    ctx = canvas.getContext("2d");
    document.body.appendChild(canvas);

    document.addEventListener("keydown", keydown);
    document.addEventListener("keyup", keyup);

    spawnRandomObstacle();
}

function restart() {
    speed = startSpeed;
    player.y = 95;
    if (score > high_score) {
        high_score = score;
        localStorage.setItem("hi", high_score);
    }
    score = 0;
    current_obstacles = [];

}

function loop() {
    update();
    render();
    window.requestAnimationFrame(loop);
}

function update() {
    scoreCounter++;
    if (scoreCounter >= scoreTime) {
        score++;
        scoreCounter = 0;
    }
    speed += 0.001;
    if (speed > topSpeed) speed = topSpeed;
    floor_x -= speed;
    if (floor_x < -1200) {
        floor_x = 0;
    }

    spawnCounter++;
    if (spawnCounter > spawnTime) {
        spawnRandomObstacle();
        spawnTime = 40 + Math.floor(Math.random() * 40);
        spawnCounter = 0;
    }

    player.update();
    current_obstacles.forEach((it) => {
        it.update();

        if (checkCollision(player.getHitbox(), it.getHitbox())) {
            restart();
        }
    });
}

function render() {
    ctx.fillStyle = color(255, 255, 255);
    ctx.fillRect(0, 0, width, height);

    // Render floor
    ctx.drawImage(spritesheet, 2, 54, 1200, 11, floor_x, 130, 1200, 11);
    ctx.drawImage(spritesheet, 2, 54, 1200, 11, floor_x+1200, 130, 1200, 11);

    player.render();
    current_obstacles.forEach((it) => {
        it.render();
    });

    // HUD    
    ctx.drawImage(spritesheet, 755, 2, 19, 11, 440, 25, 19, 11);
    drawAnyNumber(high_score, 470, 25, 5);
    drawAnyNumber(score, 530, 25, 5);
}

function keydown(e) {
    const key = e.keyCode;
    if (key == 32 || key == 38) {
        player.jump();
    }

    if (key == 40) {
        player.do_crouch(true);
    }
}

function keyup(e) {
    const key = e.keyCode;

    if (key == 40) {
        player.do_crouch(false);
    }
}

function spawnRandomObstacle() {
    const i = Math.floor(Math.random() * obstacles.length);
    let obs = {
        index: current_obstacles.length,
        i: i,
        x: width,
        y: 142 - obstacles[i].sh,
        hitbox: {
            x: 0,
            y: 0,
            w: obstacles[i].sw,
            h: obstacles[i].sh,
        },
        update: function() {
            this.x -= speed;
            if (this.x < 0 - obstacles[this.i].sw) this.die();
        },
        render: function() {
            renderObstacle(this.i, this.x, this.y);
        },
        die: function () {
            delete current_obstacles[this.index];
        },
        getHitbox: function () {
            return { x: this.x + this.hitbox.x, y: this.y + this.hitbox.y, w: this.hitbox.w, h: this.hitbox.h };
        }
    };
    current_obstacles.push(obs);
}

function renderObstacle(i, x, y) {
    ctx.drawImage(spritesheet, obstacles[i].sx, obstacles[i].sy, obstacles[i].sw, obstacles[i].sh, x, y, obstacles[i].sw, obstacles[i].sh);
}

function checkCollision(hb0, hb1) {
    return hb0.x + hb0.w > hb1.x && hb0.y + hb0.h > hb1.y && hb0.x < hb1.x + hb1.w && hb0.y < hb1.y + hb1.h;
}

function renderHitbox(entity) {
    ctx.beginPath();
    ctx.strokeStyle = color(0, 255, 0);
    ctx.rect(entity.x + entity.hitbox.x, entity.y + entity.hitbox.y, entity.hitbox.w, entity.hitbox.h);
    ctx.stroke();
}

function drawNumber(number, x, y) {
    if (number > 9 || number < 0) return;
    ctx.drawImage(spritesheet, 655 + (number*10), 2, 9, 11, x, y, 9, 11);
}

function drawAnyNumber(number, x, y, len) {
    const numlen = (number + "").length;

    for (let i = 0; i < len - numlen; i++) {
        drawNumber(0, x + (i * 10), y);
    }
    const strnum = number + "";
    for (let i = len - numlen; i < len; i++) {
        drawNumber(parseInt(strnum.charAt(i - (len - numlen))), x + (i * 10), y);
    }
}

function color(r, g, b) {
    return "rgb(" + r + "," + g + "," + b + ")";
}

function rescale() {
    canvas.style.transform = "scale(" + (window.innerWidth / width) + ") translateY(30px)";
}

window.onresize = function () {
    rescale();
}

window.onload = function () {
    start();
}