// game logic
let score = 0;
let playfield = [...Array(10)].map(_ => [...Array(23).fill(0)]);
let counter = 0;
let isDroping = false;

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

  for (let i = 0; i < playfield.length; i++) {
    for (let j = 0; j < playfield[i].length; j++) {
      const element = playfield[i][j];
      fill(colors[element]);
      rect(xOffset + (1 + i) * block,
           yOffset + (1 + j) * block,
           block,
           block);
    }
    step();
  }
}

function step() {
  counter++;
  if (counter > 60) {
    counter = 0;
    advance();
  }
}

function advance() {
  
}

function spawn() {

}