var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var centerX = canvas.width / 2;
var centerY = canvas.width / 2

function drawPointInCenter(color, scale) {
  scale = scale ? scale : 1;
  context.fillStyle = color;
  context.fillRect(centerX, centerY, scale, scale);
}

function drawPointFromCenter(distance, direction, color, scale) {
  scale = scale ? scale : 1; // in case we don't pass scale
  var pointX, pointY;
  switch(direction) {
    case FACE_NORTH:
      pointX = centerX;
      pointY = centerY - (distance * scale);
      break;
    case FACE_SOUTH:
      pointX = centerX;
      pointY = centerY + (distance * scale);
      break;
    case FACE_WEST:
      pointX = centerX - (distance * scale);
      pointY = centerY;
      break;
    case FACE_EAST:
      pointX = centerX + (distance * scale);
      pointY = centerY;
      break;
  }
  context.fillStyle = color;
  context.fillRect(pointX, pointY, scale, scale);
}

