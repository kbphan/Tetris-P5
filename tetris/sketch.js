// game logic
let score = 0;
let playfield = [...Array(10)].map(_ => [...Array(23).fill(0)]);
let counter = 0;
let stepLength = 15;
let isDroping = false;
let blockRow = 0;
let blockCol = 5;
let shape = [];


// appearance 
let block = 25;
let xOffset = 20;
let yOffset  = 20;
let colors = ['white', 'cyan', 'yellow', 'purple',
              'green', 'red', 'blue', 'orange'];


function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(60);
  console.log(playfield.toString());
}

function draw() {
  // well outline
  fill('black');
  rect(xOffset, yOffset + 4 * block, 1 * block, 21 * block);
  rect(xOffset, yOffset + 24 * block, 12 * block, 1 * block);
  rect(xOffset + 11 * block, yOffset + 4 * block, 1 * block, 21 * block);

  // current blocks on playfield
  for (let i = 0; i < playfield.length; i++) {
    for (let j = 0; j < playfield[i].length; j++) {
      const element = playfield[i][j];
      fill(colors[element]);
      rect(xOffset + (1 + i) * block,
           yOffset + (1 + j) * block,
           block,
           block);
    }
  }

  // block that is dropping
  if (isDroping) {
    fill('yellow');
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        const element = shape[i][j];
        fill(colors[element]);
        rect(xOffset + (1 + blockCol + i) * block,
              yOffset + (1 + blockRow + j) * block,
              block,
              block);
      }
    }
  }
  step();
}

function step() {
  counter++;
  if (counter > stepLength) {
    counter = 0;
    advance();
  }
}

function advance() {
  if (!isDroping) {
    spawn();
    isDroping = true;
  }
  if (blockRow + 1 > 22 || playfield[blockCol][blockRow + 1] > 0) {
    playfield[blockCol][blockRow] = 3;
    console.log(playfield.toString());
    console.log("next block value: " + playfield[blockCol][blockRow]);
    isDroping = false;
  }
  else {
    blockRow++;
  }
}

function spawn() {
  blockRow = 0;
  blockCol = 5;
  shape = [[2, 2],
           [2, 2]];
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    moveLeft();
  }
  if (keyCode === RIGHT_ARROW) {
    moveRight();
  }
  if (keyCode == DOWN_ARROW) {
    softDrop();
  }
}

function moveLeft() {
  if (blockCol > 0) {
    blockCol--;
  }
}

function moveRight() {
  if (blockCol < 9) {
    blockCol++;
  }
}

function softDrop() {
  advance();
}