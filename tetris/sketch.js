// game logic
let score;

// size and position
let block = 25;
let xOffset = 20;
let yOffset  = 20;

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  // well outline
  fill('black');
  rect(xOffset, yOffset + 4 * block, 1 * block, 21 * block);
  rect(xOffset, yOffset + 24 * block, 12 * block, 1 * block);
  rect(xOffset + 11 * block, yOffset + 4 * block, 1 * block, 21 * block);

  
}