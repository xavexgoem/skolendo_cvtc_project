const SCALE = 9;
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var centerX = canvas.width / 2;
var centerY = canvas.height / 2;

// fill the canvas with white, clearing everything
function blankCanvas() {
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);
}

// draws a point at the center of the canvas
function drawCenterPoint(color) {
  context.fillStyle = color;
  context.fillRect(centerX, centerY, SCALE, SCALE);
}

function drawStatus(droneX, droneY, mapX, mapY) {
  // player's X
  context.strokeStyle = "green";
  context.strokeRect(1, 1, 50, 30);
  context.fillStyle = "black";
  context.fillText(droneX, 10, 15);
  context.strokeRect(55, 1, 50, 30);
  context.fillText(droneY, 65, 15);
  context.strokeRect(115, 1, 50, 30);
  context.fillText(mapX, 125, 15);
  context.strokeRect(170, 1, 50, 30);
  context.fillText(mapY, 180, 15);
  context.fillText("w,a,s,d or arrow keys", 240, 15);
}
  

// draws a point at the specified x,y 
// note: these are CANVASS coords, not
// world coords.  You'll probably need
// to convert them.
function drawAtPoint(x, y, color) {
  color = color ? color : "black";
  context.fillStyle = color;
  context.fillRect(x, y, SCALE, SCALE);
}

// You win! Clear the canvas and put that it in big letters.
function drawWin() {
  blankCanvas();
  context.font = "48px sans-serif";
  context.fillStyle = "black";
  context.fillText("You Win!",0,centerY);
}
