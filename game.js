// JavaScript source code
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

const standard_frame = 25;//term given as millisecond, DON'T CHANGE
const frame = 25;
const fps = 1000 / frame;
const ratio = frame / standard_frame;

function dpf(n) { return ratio * n; }//distance per frame
function rad(n) { return n * Math.PI / 180; }
function deg(n) { return n / Math.PI * 180 }

function randint(min, max) {
    if (max == undefined) {
        max = min;
        min = 0;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
/*function colorGradientCircle(obj, color_inner, color_outer) {
    //input: a circle object{x,y,r}, 2 colors
    //output: gradient color 
    var gradient = ctx.createRadialGradient(obj.coor.x, obj.coor.y, obj.r / 10, obj.x, obj.y, obj.r * 9 / 10);
    gradient.addColorStop(0, color_inner);
    gradient.addColorStop(1, color_outer);
    return gradient;
}*/
//coordination
class Coor {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

//movable
class Movable {
    constructor(x, y, speed, dir) {
        this.coor = new Coor(x, y);
        this.speed = speed;
        this.dir = dir;
        this.img = new Image();
        this.img.src = "images/default_image.png";
    }
    move() {
        this.coor.x += dpf(this.speed * Math.cos(rad(this.dir)));
        this.coor.y += dpf(this.speed * Math.sin(rad(this.dir)));

        this.coor.x = (this.coor.x + canvas.width) % canvas.width;
        this.coor.y = (this.coor.y + canvas.height) % canvas.height;
    }
    draw() {
        ctx.beginPath();
        ctx.save();
        ctx.translate(this.coor.x, this.coor.y);
        ctx.rotate(rad(this.dir));
        ctx.drawImage(this.img, -this.img.naturalWidth / 2, -this.img.naturalHeight / 2, this.img.naturalWidth, this.img.naturalHeight);
        ctx.restore();
        ctx.closePath();
    }
}

//car class
class Car extends Movable {
    constructor(x, y, speed, dir) {
        super(x, y, speed, dir);
        this.img.src = "images/car.png";
    }
}
class Ball extends Movable {
    constructor(x, y, speed, dir, radius, color) {
        super(x, y, speed, dir);
        this.r = radius;
        this.color = color;
    }
    move() {
        var dpfx = dpf(this.speed * Math.cos(rad(this.dir)));
        var dpfy = dpf(this.speed * Math.sin(rad(this.dir)));
        if (!(0 <= this.coor.x - this.r + dpfx && this.coor.x + this.r + dpfx < canvas.width)) {
            this.dir = 180 - this.dir;
        }
        if (!(0 <= this.coor.y - this.r + dpfy && this.coor.y + this.r + dpfy < canvas.height)) {
            this.dir = 360 - this.dir;
        }

        this.coor.x += dpf(this.speed * Math.cos(rad(this.dir)));
        this.coor.y += dpf(this.speed * Math.sin(rad(this.dir)));

        this.coor.x = (this.coor.x + canvas.width) % canvas.width;
        this.coor.y = (this.coor.y + canvas.height) % canvas.height;
    }
    draw() {
        ctx.beginPath();
        ctx.save();
        ctx.translate(this.coor.x, this.coor.y);
        ctx.arc(0, 0, this.r, 0, 6.28, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
        ctx.closePath();

        /*ctx.beginPath();
        ctx.save();
        ctx.translate(this.coor.x + dpf(this.speed * Math.cos(rad(this.dir))), this.coor.y + dpf(this.speed * Math.sin(rad(this.dir))));
        ctx.arc(0, 0, this.r / 2, 0, 6.28, false);
        ctx.fillStyle = "rgba(255,255,255,1)";
        ctx.fill();
        ctx.restore();
        ctx.closePath();

        var dist = Math.sqrt(Math.pow((bhole.coor.x - this.coor.x), 2) + Math.pow((bhole.coor.y - this.coor.y), 2));
        if (dist < bhole.r) {
            var destination = new Movable(this.coor.x, this.coor.y, this.speed, this.dir);
            destination.move();
            destination.speed = bhole.g;
            destination.dir = deg(Math.atan2((bhole.coor.y - this.coor.y), (bhole.coor.x - this.coor.x)));
            destination.move();

            ctx.beginPath();
            ctx.save();
            ctx.translate(destination.coor.x, destination.coor.y);
            ctx.arc(0, 0, this.r / 4, 0, 6.28, false);
            ctx.fillStyle = "red";
            ctx.fill();
            ctx.restore();
            ctx.closePath();
        }*/
    }
}

class Blackhole {
    constructor(x, y, radius) {
        this.coor = new Coor(x, y);
        this.r = radius;
        this.g = 9.8;
    }
    pull(obj) {
        var dist = Math.sqrt(Math.pow((this.coor.x - obj.coor.x), 2) + Math.pow((this.coor.y - obj.coor.y), 2));
        if (dist < this.r) {
            //set vector destination;
            var destination = new Movable(obj.coor.x, obj.coor.y, obj.speed, obj.dir);
            destination.move();
            destination.speed = this.g / dist;
            destination.dir = deg(Math.atan2((this.coor.y - obj.coor.y), (this.coor.x - obj.coor.x)));

            destination.move();

            //set obj speed and dir
            obj.speed = Math.sqrt(Math.pow((destination.coor.x - obj.coor.x), 2) + Math.pow((destination.coor.y - obj.coor.y), 2));
            obj.dir = deg(Math.atan2((destination.coor.y - obj.coor.y), (destination.coor.x - obj.coor.x)));
        }
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.coor.x, this.coor.y, this.r, 0, 6.28, false);
        ctx.fillStyle = "rgba(0,0,0,0.5)";//colorGradientCircle(this, "black", "rgba(0,0,0,0)");
        ctx.fill();
        ctx.closePath();
        ctx.beginPath();
        ctx.arc(this.coor.x, this.coor.y, 10, 0, 6.28, false);
        ctx.fillStyle = "blue";//colorGradientCircle(this, "black", "rgba(0,0,0,0)");
        ctx.fill();
        ctx.closePath();
    }
    setGravity(n) { this.g = n;}
    setSize(n) { this.r = n;}
}

var c = new Car(0, 400, 1, 345);
var balls = []
for (var i = 0; i < 48; i++) {
    //balls[i] = new Ball(randint(canvas.width), randint(canvas.height), randint(3, 6), randint(360), randint(3, 5), "yellow");
    balls[i] = new Ball(10, randint(canvas.height / 2), 4, 0, randint(3, 5), "yellow");
    //balls[i] = new Ball(canvas.width / 2, canvas.height / 2 - 70, 6, 0, 8, "yellow");
    //balls[i] = new Ball(10, canvas.height / 2 - 90, 6, 0, 8, "yellow");
    //balls[i] = new Ball(canvas.width / 2 - 70, 10, 6, 90, 8, "yellow");
    //balls[i] = new Ball(canvas.width / 2 - 210, 10, 6, 60, 8, "yellow");
    //balls[i] = new Ball(canvas.width/2+70, 10, 6, 90, 8, "yellow");
    //balls[i] = new Ball(canvas.width-10, canvas.height / 2 - 70, randint(3, 6), 180, randint(3, 9), "yellow");
}
var bhole = new Blackhole(canvas.width / 2, canvas.height / 2, 200);

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //draw car
    //c.move();
    //c.draw();

    //draw blackhole and pull
    bhole.draw();
    for (var i of balls) {
        bhole.pull(i);
    }

    //draw balls
    for (var i of balls) {
        i.move();
        i.draw();
    }
};

setInterval(draw, frame);