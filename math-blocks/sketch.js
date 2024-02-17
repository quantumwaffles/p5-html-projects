const GRID_SIZE = 30;
const blocks = [];
let isDragging = false;
/**@type {"add"|"remove"} */
let mode = null;
let blockGroups = [];

const colors = [
    // 1 red
    [[255, 0, 0]],
    // 2 orange
    [[255, 165, 0]],
    // Less vibrant yellow
    [[200, 200, 0]],
    // 4 green
    [[0, 128, 0]],
    // 5 blue
    [[0, 0, 255]],
    // 6 indigo
    [[75, 0, 130]],
    // 7 rainbow
    [[255, 0, 0], [255, 165, 0], [255, 255, 0], [0, 128, 0], [0, 0, 255], [75, 0, 130], [128, 0, 128]],
    // viloet
    // [[128, 0, 128]],
    // 8 bright pink
    [[255, 105, 180]],
    // 9 grey
    [[128, 128, 128]],
    // 10 light grey
    // [[211, 211, 211]],
]

function setup() {
    // disable right click menu
    document.oncontextmenu = function () {
        return false;
    };
    createCanvas(windowWidth - 150, windowHeight - 150);
    // hide the mouse
    // noCursor();
}

function draw() {
    background(30);
    drawGrid();
    drawGroups();
}

function mousePressed() {
    // if left mouse button is pressed, set mode to add. If right mouse button is pressed, set mode to remove
    if (mouseButton === LEFT) {
        mode = "add";
    }
    if (mouseButton === RIGHT) {
        mode = "remove";
    }

    isDragging = true;
    if (mode === "remove") {
        removeBlock(mouseX, mouseY);
    } else {
        addBlock(mouseX, mouseY);
    }
}

function mouseReleased() {
    isDragging = false;
}

function mouseDragged() {
    if (isDragging) {
        if (mode === "remove") {
            removeBlock(mouseX, mouseY);
        } else {
            addBlock(mouseX, mouseY);
        }
    }
}

// draw each group of blocks
// all blocks in a group will be the same color
function drawGroups() {
    for (let group of blockGroups) {
        // pick a color based on the number of blocks in the group
        // use modulo to cycle through the colors array
        let colorSeq = colors[(group.length - 1) % colors.length];
        let colorIndex = 0;
        for (let cell of group) {
            // pick the next color in the sequence and wrap around if necessary
            color = colorSeq[colorIndex++ % colorSeq.length];
            drawSquare(GRID_SIZE, color, cell.x, cell.y);
        }

        drawGroupLabel(group);
    }
}

// if a cell does not already exist at the location, then add it
function addBlock(x, y) {
    // convert x and y to grid coordinates
    let xPos = floor(x / GRID_SIZE) * GRID_SIZE;
    let yPos = floor(y / GRID_SIZE) * GRID_SIZE;
    // check if a cell already exists at the location
    let exists = blocks.some((cell) => cell.x === xPos && cell.y === yPos);
    if (!exists) {
        blocks.push({ x: xPos, y: yPos });
        blockGroups = groupBlocks();
    }

}

function removeBlock(x, y) {
    // convert x and y to grid coordinates
    let xPos = floor(x / GRID_SIZE) * GRID_SIZE;
    let yPos = floor(y / GRID_SIZE) * GRID_SIZE;
    // check if a cell already exists at the location
    let index = blocks.findIndex((cell) => cell.x === xPos && cell.y === yPos);
    if (index !== -1) {
        blocks.splice(index, 1);
        blockGroups = groupBlocks();
    }
}

// create a copy of the blocks array and group them by proximity. 
// Any blocks that are touching will be grouped together
function groupBlocks() {
    let groupedBlocks = [];
    let copy = blocks.slice();
    while (copy.length > 0) {
        let current = copy.shift();
        let group = [current];
        let i = 0;
        while (i < group.length) {
            let cell = group[i];
            let neighbors = getNeighbors(cell, copy);
            group.push(...neighbors);
            copy = copy.filter((cell) => !neighbors.includes(cell));
            i++;
        }
        // sort group by y position
        group.sort((a, b) => a.y - b.y);
        // sort group by x position
        group.sort((a, b) => a.x - b.x);
        groupedBlocks.push(group);
    }
    return groupedBlocks;
}

function getNeighbors(cell, cells) {
    let neighbors = [];
    for (let i = cells.length - 1; i >= 0; i--) {
        let c = cells[i];
        let dx = abs(c.x - cell.x);
        let dy = abs(c.y - cell.y);
        if ((dx === GRID_SIZE && dy === 0) || (dy === GRID_SIZE && dx === 0)) {
            neighbors.push(c);
        }
    }
    return neighbors;
}

// draw the group label
// the label should be drawn above the leftmost block on the top row
function drawGroupLabel(group) {
    // find the topmost position
    let y = group.reduce((a, b) => a.y < b.y ? a : b).y;
    // find the rightmost position of the blocks with the topmost y value
    let x = group.
        filter((cell) => cell.y === y).
        reduce((a, b) => a.x < b.x ? a : b).x;
        
    const label = group.length;
    drawLabel(x, y, label);
}

function drawLabel(x, y, label) {
    push();
    fill(255);
    textSize(20);
    textAlign(CENTER, CENTER);
    text(label, x + GRID_SIZE / 2, y - 14);
    pop();
}

// draw a faint light grey grid
function drawGrid() {
    // Save current drawing style
    push();

    // Set the line color
    stroke(20);
    // Draw vertical lines
    for (let x = 0; x < width; x += GRID_SIZE) {
        line(x, 0, x, height);
    }
    // Draw horizontal lines
    for (let y = 0; y < height; y += GRID_SIZE) {
        line(0, y, width, y);
    }

    // Restore the drawing style to its state before push()
    pop();
}

// draw a square where the mouse cursor is
function drawSquare(size, color, x, y) {
    // Save current drawing style
    push();

    // center the square on the mouse cursor
    let xPos = floor(x / size) * size;
    let yPos = floor(y / size) * size;
    // set the fill color
    fill(color);
    // add a white border
    stroke(255);
    // draw the square
    rect(xPos, yPos, size, size);

    // Restore the drawing style to its state before push()
    pop();
}

