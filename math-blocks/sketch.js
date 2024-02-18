const GRID_SIZE = 30;
const MARGIN_TOP = GRID_SIZE * 3;
const MARGIN_LEFT = 0;
const MARGIN_RIGHT = 0;
const MARGIN_BOTTOM = 0;

let blocks = [];
let isDragging = false;
let startDragPosition = null;
let blockHit = null;
/**@type {"add"|"remove"} */
let mode = null;
let blockGroups = [];
let selection = [];

const tools = {
    // draw blocks on the screen
    draw: {
        startAction: () => {
            if (mouseButton === LEFT) {
                mode = "add";
            }
            if (mouseButton === RIGHT) {
                mode = "remove";
            }

            if (mode === "remove") {
                removeBlock(mouseX, mouseY);
            } else {
                addBlock(mouseX, mouseY);
            }
        },
        continueAction: () => {
            if (isDragging) {
                if (mode === "remove") {
                    removeBlock(mouseX, mouseY);
                } else {
                    addBlock(mouseX, mouseY);
                }
            }
        },
        endAction: () => {},
    },
    // click and drag on blocks to add them to the active selection
    // only blocks that are displayed on the screen can be selected
    // left click will add to the selection
    // right click will remove from the selection
    select: {
        startAction: () => {
            if (mouseButton === LEFT) {
                mode = "add";
            }
            if (mouseButton === RIGHT) {
                mode = "remove";
            }

            if (mode === "remove") {
                unselectBlock(mouseX, mouseY);
            } else {
                selectBlock(mouseX, mouseY);
            }
        },
        continueAction: () => {
            if (isDragging) {
                if (mode === "remove") {
                    unselectBlock(mouseX, mouseY);
                } else {
                    selectBlock(mouseX, mouseY);
                }
            }
        },
        endAction: () => {},
    },
    // the move tool will move selected blocks where the user drags
    // if no blocks are selected, the move tool will move the block
    // under the cursor
    move: {
        startAction: () => {
            if (blockHit) {
                // if the block is in the selection, then move all selected blocks
                // else, select the block hit
                if (
                    !selection.some(
                        (cell) => cell.x === blockHit.x && cell.y === blockHit.y
                    )
                ) {
                    selection = [blockHit];
                }
            } else {
                // did the user click on a group label?
                // for each group
                selection = [];
                for (let group of blockGroups) {
                    // find the topmost position
                    let y = group.reduce((a, b) => (a.y < b.y ? a : b)).y;
                    // find the rightmost position of the blocks with the topmost y value
                    let x = group
                        .filter((cell) => cell.y === y)
                        .reduce((a, b) => (a.x < b.x ? a : b)).x;
                    // is the mouse within the bounds of the label?
                    if (
                        mouseX > x &&
                        mouseX < x + GRID_SIZE &&
                        mouseY > y - 30 &&
                        mouseY < y
                    ) {
                        selection = group;
                    }
                }
                // set block hit to the first block in the selection
                blockHit = selection[0];
            }
        },
        continueAction: () => {
            if (isDragging) {
                if (blockHit) {
                    const startGridX = floor(startDragPosition.x / GRID_SIZE);
                    const startGridY = floor(startDragPosition.y / GRID_SIZE);

                    const mouseGridX = floor(mouseX / GRID_SIZE);
                    const mouseGridY = floor(mouseY / GRID_SIZE);

                    const dx = mouseGridX - startGridX;
                    const dy = mouseGridY - startGridY;

                    for (let cell of selection) {
                        cell.x += dx * GRID_SIZE;
                        cell.y += dy * GRID_SIZE;
                    }
                    startDragPosition = { x: mouseX, y: mouseY };
                    blockGroups = groupBlocks();
                }
            }
        },
        endAction: () => {
            // selection = [];
            deduplicateBlocks();
            blockGroups = groupBlocks();
        },
    },
    // the copy will act much like the move tool, except it will not move the original blocks
    // it will create a copy of all selected blocks and move the copy
    // like the move tool, if the user clicks and drags on the group label, the entire group will be copied
    // and if the user clicks on a block without a selection, then the block will be copied
    copy: {
        startAction: () => {
            if (blockHit) {
                // if the block is in the selection, then move all selected blocks
                // else, select the block hit
                if (
                    !selection.some(
                        (cell) => cell.x === blockHit.x && cell.y === blockHit.y
                    )
                ) {
                    selection = [blockHit];                    
                }

                const dx =
                        floor(mouseX / GRID_SIZE) -
                        floor(startDragPosition.x / GRID_SIZE);
                    const dy =
                        floor(mouseY / GRID_SIZE) -
                        floor(startDragPosition.y / GRID_SIZE);
                        
                    for (let cell of selection) {
                        blocks.push({
                            x: cell.x + dx * GRID_SIZE,
                            y: cell.y + dy * GRID_SIZE,
                        });
                    }
            } else {
                // did the user click on a group label?
                // for each group
                selection = [];
                for (let group of blockGroups) {
                    // find the topmost position
                    let y = group.reduce((a, b) => (a.y < b.y ? a : b)).y;
                    // find the rightmost position of the blocks with the topmost y value
                    let x = group
                        .filter((cell) => cell.y === y)
                        .reduce((a, b) => (a.x < b.x ? a : b)).x;
                    // is the mouse within the bounds of the label?
                    if (
                        mouseX > x &&
                        mouseX < x + GRID_SIZE &&
                        mouseY > y - 30 &&
                        mouseY < y
                    ) {                        
                        selection = group;

                        const dx =
                            floor(mouseX / GRID_SIZE) -
                            floor(startDragPosition.x / GRID_SIZE);
                        const dy =
                            floor(mouseY / GRID_SIZE) -
                            floor(startDragPosition.y / GRID_SIZE);
                        for (let cell of selection) {
                            blocks.push({
                                x: cell.x + dx * GRID_SIZE,
                                y: cell.y + dy * GRID_SIZE,
                            });
                        }
                    }
                }
                // set block hit to the first block in the selection
                blockHit = selection[0];                
            }
        },
        continueAction: () => {
            if (isDragging) {
                if (blockHit) {
                    const startGridX = floor(startDragPosition.x / GRID_SIZE);
                    const startGridY = floor(startDragPosition.y / GRID_SIZE);

                    const mouseGridX = floor(mouseX / GRID_SIZE);
                    const mouseGridY = floor(mouseY / GRID_SIZE);

                    const dx = mouseGridX - startGridX;
                    const dy = mouseGridY - startGridY;

                    for (let cell of selection) {
                        cell.x += dx * GRID_SIZE;
                        cell.y += dy * GRID_SIZE;
                    }
                    startDragPosition = { x: mouseX, y: mouseY };
                    blockGroups = groupBlocks();
                }
            }
        },
        endAction: () => {
            // selection = [];
            deduplicateBlocks();
            blockGroups = groupBlocks();
        },
    },
};
let activeTool = tools.draw;

const buttonSize = { w: 100, h: 50 };
const toolbar = [];
const BUTTON_HEIGHT = 50;
const BUTTON_WIDTH = 75;
toolbar.push(
    new Button(10, 10, BUTTON_WIDTH, BUTTON_HEIGHT, "Clear", () => {
        blocks = [];
        blockGroups = [];
        selection = [];
    })
);

toolbar.push(
    new Button(100, 10, BUTTON_WIDTH, BUTTON_HEIGHT, "Draw", (btn) => {
        
        activeTool = tools.draw;
        toolbar.forEach((b) => b.select(false));
        btn.select(true);
        selection = [];
    })
);
toolbar[1].select(true);

toolbar.push(
    new Button(190, 10, BUTTON_WIDTH, BUTTON_HEIGHT, "Select", (btn) => {
        activeTool = tools.select;
        toolbar.forEach((b) => b.select(false));
        btn.select(true);
        selection = [];
    })
);

// add a move button
toolbar.push(
    new Button(280, 10, BUTTON_WIDTH, BUTTON_HEIGHT, "Move", (btn) => {
        activeTool = tools.move;
        toolbar.forEach((b) => b.select(false));
        btn.select(true);
    })
);

// add a copy button
toolbar.push(
    new Button(370, 10, BUTTON_WIDTH, BUTTON_HEIGHT, "Copy", (btn) => {
        activeTool = tools.copy;
        toolbar.forEach((b) => b.select(false));
        btn.select(true);
    })
);

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
    [
        [255, 0, 0],
        [255, 165, 0],
        [255, 255, 0],
        [0, 128, 0],
        [0, 0, 255],
        [75, 0, 130],
        [128, 0, 128],
    ],
    // viloet
    // [[128, 0, 128]],
    // 8 bright pink
    [[255, 105, 180]],
    // 9 grey
    [[128, 128, 128]],
    // 10 light grey
    // [[211, 211, 211]],
];

function setup() {
    // disable right click menu
    document.oncontextmenu = function () {
        return false;
    };
    const PAD_X = 30;
    const PAD_Y = 40;
    const w = floor((windowWidth - PAD_X) / GRID_SIZE) * GRID_SIZE;
    const h = floor((windowHeight - PAD_Y) / GRID_SIZE) * GRID_SIZE;
    createCanvas(w, h);
    // hide the mouse
    // noCursor();
}

function draw() {
    background(30);
    drawGrid();
    drawToolbar();
    drawGroups();
    drawEquationLabel();
    drawSelection();
}

function inBounds(x, y) {
    return (
        x > MARGIN_LEFT &&
        x < width - MARGIN_RIGHT &&
        y > MARGIN_TOP &&
        y < height - MARGIN_BOTTOM
    );
}

function mousePressed() {
    if (toolbar.some((button) => button.clicked())) {
        return;
    }

    if (!inBounds(mouseX, mouseY)) {
        return;
    }

    isDragging = true;
    startDragPosition = { x: mouseX, y: mouseY };
    const gridX = floor(mouseX / GRID_SIZE) * GRID_SIZE;
    const gridY = floor(mouseY / GRID_SIZE) * GRID_SIZE;
    blockHit = blocks.filter(
        (block) => block.x === gridX && block.y === gridY
    )[0];

    activeTool.startAction();
}

function mouseReleased() {
    if (!isDragging) {
        return;
    }

    isDragging = false;
    toolbar.forEach((button) => (button.isActive = false));

    activeTool.endAction();
}

function mouseMoved() {
    for (let button of toolbar) {
        button.hover();
    }
}

function mouseDragged() {
    if (!inBounds(mouseX, mouseY)) {
        return false;
    }

    activeTool.continueAction();
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
            c = colorSeq[colorIndex++ % colorSeq.length];
            drawSquare(GRID_SIZE, c, cell.x, cell.y);
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

function selectBlock(x, y) {
    // convert x and y to grid coordinates
    let xPos = floor(x / GRID_SIZE) * GRID_SIZE;
    let yPos = floor(y / GRID_SIZE) * GRID_SIZE;
    // check if a cell already exists at the location
    let index = blocks.findIndex((cell) => cell.x === xPos && cell.y === yPos);
    if (index !== -1) {
        // if selection does not already contain the block
        if (!selection.some((cell) => cell.x === xPos && cell.y === yPos)) {
            selection.push(blocks[index]);
        }
    }
}

function unselectBlock(x, y) {
    // convert x and y to grid coordinates
    let xPos = floor(x / GRID_SIZE) * GRID_SIZE;
    let yPos = floor(y / GRID_SIZE) * GRID_SIZE;

    // check if a block exists at the location
    let index = selection.findIndex(
        (cell) => cell.x === xPos && cell.y === yPos
    );
    if (index !== -1) {
        selection.splice(index, 1);
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
    let y = group.reduce((a, b) => (a.y < b.y ? a : b)).y;
    // find the rightmost position of the blocks with the topmost y value
    let x = group
        .filter((cell) => cell.y === y)
        .reduce((a, b) => (a.x < b.x ? a : b)).x;

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
    // set the border to a color that is slightly darker than the fill color
    stroke(color.map((c) => (c * 0.8) | 0));

    strokeWeight(2);
    // draw the square
    rect(xPos, yPos, size, size);

    // Restore the drawing style to its state before push()
    pop();
}

function drawToolbar() {
    // draw a rectangle across the top of the screen in the margin
    push();
    fill(50);
    rect(0, 0, width, MARGIN_TOP);
    pop();

    for (let button of toolbar) {
        button.draw();
    }
}

// now we're going to draw a label at the top of the screen
// if there is only 1 group, then we'll just show the total number of blocks
// if there are multiple groups, then we'll show an equation that adds each group
// to equal the total number of blocks
function drawEquationLabel() {
    let total = blocks.length;
    let label = total;
    if (blockGroups.length > 1) {
        label = blockGroups
            .map((group) => group.length)
            .join(" + ")
            .concat(" = " + total);
    }
    push();
    fill(255);
    textSize(20);
    textAlign(RIGHT, CENTER);
    text(label, width - 20, 20);
    pop();
}

// draw the selection to the screen
// selected blocks are highlighted with a thick white border
// only the outer edges of the blocks are highlighted
// borders between blocks are not drawn
function drawSelection() {
    for (let cell of selection) {
        // if no neighbors are on the left, then draw the left border
        if (
            !selection.some((c) => c.x === cell.x - GRID_SIZE && c.y === cell.y)
        ) {
            drawBorder(cell.x, cell.y, "left");
        }
        // if no neighbors are on the right, then draw the right border
        if (
            !selection.some((c) => c.x === cell.x + GRID_SIZE && c.y === cell.y)
        ) {
            drawBorder(cell.x, cell.y, "right");
        }
        // if no neighbors are on the top, then draw the top border
        if (
            !selection.some((c) => c.x === cell.x && c.y === cell.y - GRID_SIZE)
        ) {
            drawBorder(cell.x, cell.y, "top");
        }
        // if no neighbors are on the bottom, then draw the bottom border
        if (
            !selection.some((c) => c.x === cell.x && c.y === cell.y + GRID_SIZE)
        ) {
            drawBorder(cell.x, cell.y, "bottom");
        }
    }

    drawSelectionLabel();
}

// display the number of blocks in the selection above the top left selected block
function drawSelectionLabel() {
    if (selection.length === 0) {
        return;
    }
    let y = selection.reduce((a, b) => (a.y < b.y ? a : b)).y;
    let x = selection
        .filter((cell) => cell.y === y)
        .reduce((a, b) => (a.x < b.x ? a : b)).x;
    const label = selection.length;
    // draw a rectabngle behind the label
    push();
    fill(50);
    noStroke();
    rect(x, y - 30, 30, 30);
    pop();
    drawLabel(x, y, label);
}

/**
 *
 * @param {number} x
 * @param {number} y
 * @param {"left"|"right"|"top"|"bottom"} side
 */
function drawBorder(x, y, side) {
    push();
    fill(255);
    noStroke();
    switch (side) {
        case "left":
            rect(x, y, 4, GRID_SIZE);
            break;
        case "right":
            rect(x + GRID_SIZE - 4, y, 4, GRID_SIZE);
            break;
        case "top":
            rect(x, y, GRID_SIZE, 4);
            break;
        case "bottom":
            rect(x, y + GRID_SIZE - 4, GRID_SIZE, 4);
            break;
    }
    pop();
}


function deduplicateBlocks() {
    let deduped = [];
    for (let block of blocks) {
        if (!deduped.some((b) => b.x === block.x && b.y === block.y)) {
            deduped.push(block);
        }
    }
    blocks = deduped;
}