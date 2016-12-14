const SCALE = 9; // This is what we scale every point by, so the game isn't teeny-tiny
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
  context.strokeStyle = "red";
  context.fillStyle = "white";
  // player's X
  context.fillRect(1, 1, 70, 30); // We have to fill the rectangle; strokeRect won't draw the interior
  context.strokeRect(1, 1, 70, 30);
  // player's Y
  context.fillRect(70, 1, 70, 30);
  context.strokeRect(70, 1, 70, 30);
  // goal's X
  context.strokeStyle = "green";
  context.fillRect(150, 1, 70, 30);
  context.strokeRect(150, 1, 70, 30);
  // goal's Y
  context.fillRect(220, 1, 70, 30);
  context.strokeRect(220, 1, 70, 30);
  // Now fill the text (we couldn't do this before, because fillStyle was set to white
  context.fillStyle="black";
  context.fillText("Your X: " + droneX, 5, 15);
  context.fillText("Your Y: " + droneY, 75, 15);
  context.fillText("Goal X: " + map.endX, 160, 15);
  context.fillText("Goal Y: " + mapY, 230, 15);

  // keyboard guide
  context.fillStyle = "red"
  context.fillText("w,a,s,d to move", 300, 12);
  context.fillText("Reach the goal", 300, 25);
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
