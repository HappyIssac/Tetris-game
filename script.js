const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20);

let arena = createMatrix(12, 20);
let player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
};

let colors = [
    null,
    '#FF0D72', // - I
    '#0DC2FF', // - J
    '#0DFF72', // - L
    '#F538FF', // - O
    '#FF8E0D', // - S
    '#FFE138', // - T
    '#3877FF', // - Z
];

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type) {
    switch (type) {
        case 'T':
            return [
                [0, 0, 0],
                [5, 5, 5],
                [0, 5, 0],
            ];
        case 'O':
            return [
                [2, 2],
                [2, 2],
            ];
        case 'L':
            return [
                [0, 3, 0],
                [0, 3, 0],
                [0, 3, 3],
            ];
        case 'J':
            return [
                [0, 4, 0],
                [0, 4, 0],
                [4, 4, 0],
            ];
        case 'I':
            return [
                [0, 2, 0, 0],
                [2, 2, 2, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];
        case 'S':
            return [
                [0, 6, 6],
                [6, 6, 0],
                [0, 0, 0],
            ];
        case 'Z':
            return [
                [7, 7, 0],
                [0, 7, 7],
                [0, 0, 0],
            ];
    }
}

// ... add more functions for handling movement, rotation, and game state updates & rendering below.

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                // Fill the block with its color
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
                
                // Add outline to the block
                context.strokeStyle = '#FFFFFF';
                context.lineWidth = 0.05;
                context.strokeRect(x + offset.x, y + offset.y, 1, 1);
                
                // Add inner accent line (top-left corner)
                context.beginPath();
                context.moveTo(x + offset.x + 0.15, y + offset.y + 0.15);
                context.lineTo(x + offset.x + 0.15, y + offset.y + 0.85);
                context.lineTo(x + offset.x + 0.85, y + offset.y + 0.85);
                context.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                context.lineWidth = 0.03;
                context.stroke();
                
                // Add shadow effect (bottom-right corner)
                context.beginPath();
                context.moveTo(x + offset.x + 0.85, y + offset.y + 0.15);
                context.lineTo(x + offset.x + 0.85, y + offset.y + 0.85);
                context.lineTo(x + offset.x + 0.15, y + offset.y + 0.85);
                context.strokeStyle = 'rgba(0, 0, 0, 0.3)';
                context.lineWidth = 0.03;
                context.stroke();
            }
        });
    });
}

function draw() {
    // Clear the canvas with a dark background
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines for visual accent
    context.strokeStyle = 'rgba(50, 50, 80, 0.4)';
    context.lineWidth = 0.02;
    
    // Draw vertical grid lines
    for (let i = 0; i <= arena[0].length; i++) {
        context.beginPath();
        context.moveTo(i, 0);
        context.lineTo(i, arena.length);
        context.stroke();
    }
    
    // Draw horizontal grid lines
    for (let i = 0; i <= arena.length; i++) {
        context.beginPath();
        context.moveTo(0, i);
        context.lineTo(arena[0].length, i);
        context.stroke();
    }
    
    // Draw the game pieces
    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

// Logic for updating the game state, moving pieces, rotating, scoring, clearing lines, handling key presses, etc.

function updateScore() {
    document.getElementById('score').innerText = "Score: " + player.score;
}

function resetPlayer() {
    const pieces = 'ILJOTSZ';
    player.matrix = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        playerMove(-1);
    } else if (event.keyCode === 39) {
        playerMove(1);
    } else if (event.keyCode === 40) {
        playerDrop();
    } else if (event.keyCode === 81) {
        playerRotate(-1);
    } else if (event.keyCode === 87) {
        playerRotate(1);
    }
});

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        resetPlayer();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

function arenaSweep() {
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += 10;
    }
}

// Initialize the game
resetPlayer();
updateScore();
update();
document.addEventListener('keydown', event => {
    if (event.keyCode === 37) { // Left Arrow
        playerMove(-1);
    } else if (event.keyCode === 39) { // Right Arrow
        playerMove(1);
    } else if (event.keyCode === 40) { // Down Arrow
        playerDrop();
    } else if (event.keyCode === 81) { // Q Key - for counterclockwise rotation
        playerRotate(-1);
    } else if (event.keyCode === 38) { // Up Arrow - for clockwise rotation
        playerRotate(1);
    }
});