let

canvas, ctx,
width = 600, height = 150,

spritesheet = document.getElementById("spritesheet");

score = 0, high_score = 0,
time = 0, speed = 5,
floor_x = 0,
grav = 0.5;
    
player = {
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
        if(!this.crouch) ctx.drawImage(spritesheet, 936, 2, 44, 47, this.x, this.y, 44, 47);
        else ctx.drawImage(spritesheet, 1112, 2, 59, 47, this.x, this.y, 59, 47);
    },
    jump: function () {
        if(player.y == 95) this.vy = -9;
    },
    do_crouch: function(b) {
        this.crouch = b;
        this.hitbox = !b ? this.hb_stand : this.hb_crouch;
    }
}
;

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
}

function loop() {
    update();
    render();
    window.requestAnimationFrame(loop);
}

function update() {
    time++;
    speed += 0.001;
    floor_x -= speed;
    if (floor_x < -1200) {
        floor_x = 0;
    }

    player.update();
}

function render() {
    ctx.fillStyle = color(255, 255, 255);
    ctx.fillRect(0, 0, width, height);

    // Render floor
    ctx.drawImage(spritesheet, 2, 54, 1200, 11, floor_x, 130, 1200, 11);
    ctx.drawImage(spritesheet, 2, 54, 1200, 11, floor_x+1200, 130, 1200, 11);

    player.render();
    renderHitbox(player);
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

function renderHitbox(entity) {
    ctx.beginPath();
    ctx.strokeStyle = color(0, 255, 0);
    ctx.rect(entity.x + entity.hitbox.x, entity.y + entity.hitbox.y, entity.hitbox.w, entity.hitbox.h);
    ctx.stroke();
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