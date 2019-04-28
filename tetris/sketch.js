// game logic
let score = 0;
let playfield = [...Array(10)].map(_ => [...Array(23).fill(0)]);
let counter = 0;
let stepLength = 10;
let isDroping = false;
let blockRow = 0;
let blockCol = 5;
let shape = [];
const lBlock = [[1, 1, 1, 1]];
const oBlock = [[2, 2],
                [2, 2]];


// appearance 
let block = 25;
let xOffset = 20;
let yOffset  = 20;
let colors = ['white', 'cyan', 'yellow', 'purple',
              'green', 'red', 'blue', 'orange'];


function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(60);
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
  if (isLegalMove(0, 1)) {
    blockRow++;
  }
  else {
    land();
    isDroping = false;
    
  }
}

function isLegalMove(x, y) {
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].length; j++) {
      const element = shape[i][j];
      const isOutOfWell = (blockCol + i + x) > 10 || (blockCol + i + x) < 0;
      if (isOutOfWell) {
        return false;
      }
      const playfieldBlock = playfield[blockCol + i + x][blockRow + j + y];
      const isBottom = (blockRow + j + y) > 22;
      if ((element > 0 && playfieldBlock > 0) || isBottom) {
        return false;
      }
    }
  }
  return true;
}

function land() {
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].length; j++) {
      const element = shape[i][j];
      // check to make sure landing does not clear with whitespace
      if (element > 0) {
        playfield[blockCol + i][blockRow + j] = element;
      }
    }
  }
  let arrayLog = "";
  for (let i = 0; i < playfield.length; i++) {
    for (let j = 0; j < playfield[i].length; j++) {
      const element = playfield[i][j];
      arrayLog += element + " ";
    }
    arrayLog += "\n";
  }
  console.log(arrayLog);
}

function spawn() {
  blockRow = 0;
  blockCol = 5;
  shape = lBlock;
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
  if (isLegalMove(-1, 0)) {
    blockCol--;
  }
}

function moveRight() {
  if (isLegalMove(1, 0)) {
    blockCol++;
  }
}

function softDrop() {
  advance();
}