const SCALE = 3;
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var centerX = canvas.width / 2;
var centerY = canvas.width / 2;

function blankCanvas() {
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawCenterPoint(color) {
  context.fillStyle = color;
  context.fillRect(centerX, centerY, SCALE, SCALE);
}


function drawAtPoint(x, y, color) {
  color = color ? color : "black";
  context.fillStyle = color;
  context.fillRect(x, y, SCALE, SCALE);
}

