let g;
let g2;
let paused = false;
const SCALE = 10;
let points = [];

function setup() {
    const PAD = 60;
    const minDim = min(windowWidth, windowHeight);
    const w = minDim - PAD;
    const h = minDim - PAD;
    createCanvas(w, h);

    // disable aliasing
    noSmooth();
    // set frame rate
    frameRate(30);

    g = createGraphics(Math.floor(w / SCALE), Math.floor(h / SCALE));
    g2 = createGraphics(Math.floor(w / SCALE), Math.floor(h / SCALE));

    fillRandomNoise(g);
    
    for (let i = 0; i < 2; i++) {
        const x = floor(random(g.width));
        const y = floor(random(g.height));
        const loc = createVector(x, y);
        const vel = createVector(random(-1, 1), random(-1, 1));
        points.push(new Point(loc, vel));
    }
}

function draw() {
    // g.background(0);
    const steps = 2;
    for(let step = 0; step < steps; step++) {
        for (let i = 0; i < points.length - 1; i++) {
            drawLine(
                points[i].loc.x,
                points[i].loc.y,
                points[i + 1].loc.x,
                points[i + 1].loc.y,
                g
            );
            // g.stroke(255, 0, 0);
            // g.line(
            //     points[i].loc.x,
            //     points[i].loc.y,
            //     points[i + 1].loc.x,
            //     points[i + 1].loc.y
            // )
        }
    
        for (let p of points) {
            p.update(g);
        }

    }

    g2.image(g, 0, 0);
    image(g2, 0, 0, width, height);

    rect(0, 0, 240, 40);
    textSize(32);
    text("Touch to Pause", 10, 30);
}

function keyPressed() {
    if (key === " ") {
        paused = !paused;
        if (paused) {
            noLoop();
        } else {
            loop();
        }
    }
}

function touchStarted() {
    paused = true;
    noLoop();
}

function touchEnded() {
    paused = false;
    loop();
}


function fillRandomNoise(g) {
    g.loadPixels();
    const colors = [color(0, 0, 0), color(255, 255, 255)];

    for (let i = 0; i < g.width; i++) {
        for (let j = 0; j < g.height; j++) {
            g.set(i, j, random(colors));
        }
    }
    g.updatePixels();
}

/**
 * Draws a line between two points on a graphics object using Bresenham's line algorithm
 * @param {*} x1 - x coordinate of first point
 * @param {*} y1 - y coordinate of first point
 * @param {*} x2 - x coordinate of second point
 * @param {*} y2 - y coordinate of second point
 * @param {*} g - graphics object to draw line on
 */
function drawLine(x0, y0, x1, y1, g) {
    g.loadPixels();

    // truncate to integer values
    x0 = Math.round(x0);
    y0 = Math.round(y0);
    x1 = Math.round(x1);
    y1 = Math.round(y1);

    const dx = abs(x1 - x0);
    const dy = abs(y1 - y0);
    const sx = Math.sign(x1 - x0);
    const sy = Math.sign(y1 - y0);
    let err = dx - dy;

    while (true) {
        const c = g.get(x0, y0);
        const inv = color(255 - c[0], 255 - c[1], 255 - c[2]);

        g.set(x0, y0, inv);

        if (x0 === x1 && y0 === y1) break;

        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x0 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y0 += sy;
        }
    }

    g.updatePixels();    
}

// takes 2 integers and provdes an xor of their bits
function xorBits(a, b) {
    return a ^ b;
}

class Point {
    constructor(loc, vel) {
        this.loc = loc;
        this.vel = vel;
    }

    update(g) {
        this.loc.add(this.vel);
        this.bounce(g);
    }

    bounce(g) {
        if (this.loc.x < 0 || this.loc.x >= g.width) {
            this.vel.x *= -1;
        }
        if (this.loc.y < 0 || this.loc.y >= g.height) {
            this.vel.y *= -1;
        }
    }
}
