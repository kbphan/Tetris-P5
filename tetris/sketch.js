// Declare a "SerialPort" object
var serial;
var latestData = 'waiting for data'; // you'll use this to write incoming data to the canvas
const portName = 'COM3'; // fill in your serial port name here

let potVal;


// game logic
let score = 0;
let level = 1;
let linesCleared = 0;
let isGameOver = false;
let playfield = [...Array(10)].map(_ => [...Array(23).fill(0)]);
let counter = 0;
let stepLength = 30;
let landTimer = 2;
let isDroping = false;
let blockRow = 0;
let blockCol = 3;
let ghostRow = 0;
let shape;
let holdShape = 'empty';
let canHold = true;
let scoreValues = [0, 100, 300, 500, 800];
let bag = [];

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
              'green', 'red', 'blue', 'orange', 'grey'];

// sound
let player;
let soundEffects;
let musicStart = false;

function preload() {
  player = new Tone.Player("./song.mp3").toMaster();
  player.loop = true;
}

function setup() {
  createCanvas(windowWidth - 10, windowHeight - 10);
  background('white');
  frameRate(60);
  strokeWeight(3);
  spawn();
  soundEffects = new Tone.Players({
    clear: "./effect1.mp3",
  }).toMaster();
  
  serial = new p5.SerialPort(); // make a new instance of the serialport library
  serial.on('list', printList); // set a callback function for the serialport list event
  serial.on('connected', serverConnected); // callback for connecting to the server
  serial.on('open', portOpen); // callback for the port opening
  serial.on('data', serialEvent); // callback for when new data arrives
  serial.on('error', serialError); // callback for errors
  serial.on('close', portClose); // callback for the port closing

  serial.list(); // list the serial ports
  serial.open(portName); // open a serial port

  serial.write('x'); // send a byte requesting more serial data
}

// get the list of ports:
function printList(portList) {
  // portList is an array of serial port names
  for (var i = 0; i < portList.length; i++) {
    // Display the list the console:
    console.log(i + " " + portList[i]);
  }
}

function serverConnected() {
  console.log('connected to server.');
}

function portOpen() {
  console.log('the serial port opened.')
}

function serialEvent() {
  // read a string from the serial port
  // until you get carriage return and newline:
  var inString = serial.readStringUntil('\r\n');
  //check to see that there's actually a string there:
  if (inString.length > 0) {
      var sensors = split(inString, ','); // split the string on the commas
      if (sensors.length > 1) { // if there are two elements
        potVal = sensors[0];
        if (sensors[1] == 1) {
          rotateBlock();
        }
        console.log(sensors);
      }
    serial.write('x'); // send a byte requesting more serial data
  }
}

function serialError(err) {
  console.log('Something went wrong with the serial port. ' + err);
}

function portClose() {
  console.log('The serial port closed.');
}

function draw() {
  clear();

  
  // UI
  noStroke();
  fill('black');
  textSize(48);
  text("Score: " + score, 850, 200);
  text("Level: " + level, 850, 300);
  text("Lines: " + linesCleared, 850, 400);
  textSize(24);
  text("Next", 475, 150);
  text("Hold", 475, 350);
  text("Pot Value: " + potVal, 10, 40);

  // well outline
  fill('black');
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

  // holding block
  for (let i = 0; i < holdShape.length; i++) {
    for (let j = 0; j < holdShape[i].length; j++) {
      const element = holdShape[i][j];
      if (element > 0) {
        fill(colors[element]);
        rect(xOffset + (13 + j) * block,
              yOffset + (10 + i) * block,
              block,
              block);
      }
    }
  }

  // next block
  if (isDroping) {
    let nextBlock = bag[bag.length -1];
    for (let i = 0; i < nextBlock.length; i++) {
      for (let j = 0; j < nextBlock[i].length; j++) {
        const element = nextBlock[i][j];
        if (element > 0) {
          fill(colors[element]);
          rect(xOffset + (13 + j) * block,
                yOffset + (5 + i) * block,
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
  
  if (isGameOver) {
    if (counter > 180) {
      playfield = [...Array(10)].map(_ => [...Array(23).fill(0)]);
      counter = 0;
      isGameOver = false;
      score = 0;
      level = 1;
      linesCleared = 0;
      holdShape = 'empty';
    }
  }

  else {
    let currentStepLength = stepLength;
    if (keyIsDown(DOWN_ARROW)) {
      currentStepLength /= 3;
    }
    if (counter > currentStepLength) {
      counter = 0;
      advance();
    }
  }
}

function advance() {
  if (potVal < 500) {
    moveRight();
  }
  if (potVal > 650) {
    moveLeft();
  }
  if (!isDroping) {
    spawn();
    isDroping = true;
  }

  if (isLegalMove(0, 1)) {
    blockRow++;
    // score for soft drop
    if (keyIsDown(DOWN_ARROW)) {
      score++;
    }
  }
  else if (landTimer == 0) {
    land();
    isDroping = false;
    landTimer = 2;
  }
  else {
    landTimer--;
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
  canHold = true;
}

function checkRows() {
  let rowsToClear = [];
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
      rowsToClear.push(i);
    }
  }
  clearRow(rowsToClear);
}

function checkLose() {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < playfield.length; j++) {
      const element = playfield[j][i];
      if (element > 0) {
        gameOver();
      }
    }
  }
}

function gameOver() {
  for (let i = 0; i < playfield.length; i++) {
    for (let j = 0; j < playfield[i].length; j++) {
      const element = playfield[i][j];
      if (element > 0) {
        playfield[i][j] = 8 ;
      }
    }
  }
  isGameOver = true;
  counter = 0;
}

function clearRow(rowsToClear) {
  linesCleared += rowsToClear.length;
  score += scoreValues[rowsToClear.length] * level;
  if (rowsToClear.length > 0) {
    serial.write(1);
    serial.write(2);
  }
  if (rowsToClear.length == 4) {
    soundEffects.get("clear").start();
  }
  if (linesCleared / 6 > level) {
    level++;
    if (stepLength > 2) {
      stepLength--;
    }
    serial.write(3);
  }
  for (let i = 0; i < rowsToClear.length; i++) {
    const row = rowsToClear[i];
    for (let j = 0; j < playfield.length; j++) {
      playfield[j].splice(row, 1);
      playfield[j].unshift([0]);
    }
  }
}

function spawn() {
  let rng = random([0, 1, 2, 3, 4, 5, 6]);
  if (bag.length <= 1) {
    let tempBag = blockShapes;
    for (let i = tempBag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tempBag[i], tempBag[j]] = [tempBag[j], tempBag[i]];
    }
    bag = tempBag.concat(bag);
  }
  console.log("length of bag: " + bag.length);
  shape = bag.pop();
  blockRow = 0;
  blockCol = 3;
}

function keyPressed() {
  if (!musicStart) {
    player.start();
    musicStart = true;
  }
  if (keyCode === LEFT_ARROW) {
    moveLeft();
  }
  if (keyCode === RIGHT_ARROW) {
    moveRight();
  }
  if (keyCode == UP_ARROW) {
    rotateBlock();
  }
  if (keyCode == 32) {
    hardDrop();
  }
  if (keyCode == SHIFT) {
    hold();
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

function hardDrop() {
  let hardDropScore = 0;
  while(isLegalMove(0, 1)) {
    hardDropScore++
    blockRow++
  }
  score += 2 * hardDropScore;
  land();
  isDroping = false;
}

function hold() {
  if (canHold) {
    let tempShape = holdShape;
    if (!(holdShape == 'empty')) {
      bag.push(tempShape);
    }
    holdShape = shape;
    spawn();
    canHold = false;
  }
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
