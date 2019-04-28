// game logic
let score = 0;
let playfield = [...Array(10)].map(_ => [...Array(23).fill(0)]);
let counter = 0;
let stepLength = 10;
let isDroping = false;
let blockRow = 0;
let blockCol = 3;
let ghostRow = 0;
let shape;

// block shapes
const iBlock = [[0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]];
const oBlock = [[2, 2],
                [2, 2]];
const tBlock = [[0, 3, 0],
                [3, 3, 3],
                [0, 0, 0]];
const sBlock = [[0, 4, 4],
                [4, 4, 0],
                [0, 0, 0]];
const zBlock = [[5, 5, 0],
                [0, 5, 5],
                [0, 0, 0]];
const jBlock = [[6, 0, 0],
                [6, 6, 6],
                [0, 0, 0]];                
const lBlock = [[0, 0, 7],
                [7, 7, 7],
                [0, 0, 0]];
const blockShapes = [iBlock, oBlock, tBlock,
                     sBlock, zBlock, jBlock,
                     lBlock];  

// appearance 
let block = 35;
let xOffset = 20;
let yOffset  = 20;
let colors = ['white', 'cyan', 'yellow', 'purple',
              'green', 'red', 'blue', 'orange'];


function setup() {
  createCanvas(windowWidth, windowHeight);
  background('white');
  frameRate(60);
  strokeWeight(3);
  spawn();
}

function draw() {
  clear();

  // well outline
  fill('black');
  noStroke();
  rect(xOffset, yOffset + 4 * block, 1 * block, 21 * block);
  rect(xOffset, yOffset + 24 * block, 12 * block, 1 * block);
  rect(xOffset + 11 * block, yOffset + 4 * block, 1 * block, 21 * block);

  // current blocks on playfield
  for (let i = 0; i < playfield.length; i++) {
    for (let j = 0; j < playfield[i].length; j++) {
      const element = playfield[i][j];
      if (element > 0) {
        stroke('black');
        fill(colors[element]);
        rect(xOffset + (1 + i) * block,
           yOffset + (1 + j) * block,
           block,
           block);
      }
      
    }
  }

  // block that is dropping
  if (isDroping) {
    // ghost block for player aid
    ghostRow = 0;
    while(isLegalMove(0, ghostRow)) {
      ghostRow++;
    }
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        const element = shape[i][j];
        if (element > 0) {
          stroke(colors[element]);
          fill(0, 0, 0, 0);
          rect(xOffset + (1 + blockCol + j) * block,
                yOffset + (ghostRow + blockRow + i) * block,
                block,
                block);
        }
      }
    }
    stroke('black'); 
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        const element = shape[i][j];
        if (element > 0) {
          fill(colors[element]);
          rect(xOffset + (1 + blockCol + j) * block,
               yOffset + (1 + blockRow + i) * block,
               block,
               block);
        }
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
      const isOutOfWell = (blockCol + j + x) > 9 || (blockCol + j + x) < 0;
      const isBottom = (blockRow + i + y) > 22;
      let playfieldBlock;
      if (isOutOfWell || isBottom) {
        playfieldBlock = 1;
      }
      else {
        playfieldBlock = playfield[blockCol + j + x][blockRow + i + y];
      }
      if (element > 0 && playfieldBlock > 0) {
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
        playfield[blockCol + j][blockRow + i] = element;
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
  checkRows();
  checkLose();
}

function checkRows() {
  for (let i = 0; i < playfield[0].length; i++) {
    let isComplete = true;
    let rowLog = "row: ";
    for (let j = 0; j < playfield.length; j++) {
      const element = playfield[j][i];
      if (element == 0) {
        isComplete = false;
      }
      rowLog += element + " ";
    }
    if (isComplete) {
      clearRow(i);
    }
    console.log(rowLog);
  }
}

function checkLose() {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < playfield.length; j++) {
      const element = playfield[j][i];
      if (element > 0) {
        playfield = [...Array(10)].map(_ => [...Array(23).fill(0)]);
      }
    }
  }
}

function clearRow(x) {
  for (let i = 0; i < playfield.length; i++) {
    playfield[i].splice(x, 1);
    playfield[i].unshift([0]);
  }
}

function spawn() {
  let rng = random([0, 1, 2, 3, 4, 5, 6]);
  shape = blockShapes[rng];
  blockRow = 0;
  blockCol = 3;
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
  if (keyCode == UP_ARROW) {
    rotateBlock();
  }
  if (keyCode == SHIFT) {
    hardDrop();
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

function hardDrop() {
  while(isLegalMove(0, 1)) {
    blockRow++
  }
  land();
  isDroping = false;
}

function rotateBlock() {
  let rotation = [];
  let temp = [];
  for(let i = 0; i < shape[0].length; i++) {
      let row = shape.map(e => e[i]).reverse();
      rotation.push(row);
  }
  temp = shape;
  shape = rotation;
  if (!isLegalMove(0, 0)) {
    shape = temp;
  }
}