const SCALE = 1;
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

function drawPointFromCenter(distance, direction) {
  var pointX, pointY;

  switch(direction) {
    case FACE_NORTH:
      pointX = centerX;
      pointY = centerY - (distance * SCALE);
      break;
    case FACE_SOUTH:
      pointX = centerX;
      pointY = centerY + (distance * SCALE);
      break;
    case FACE_WEST:
      pointX = centerX - (distance * SCALE);
      pointY = centerY;
      break;
    case FACE_EAST:
      pointX = centerX + (distance * SCALE);
      pointY = centerY;
      break;
  }
  return [pointX, pointY];
}

function drawAtPoint(x, y, color) {
  color = color ? color : "black";
  context.fillStyle = color;
  context.fillRect(x, y, SCALE, SCALE);
}

