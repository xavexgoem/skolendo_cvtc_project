var drone = {
  x: 0,
  y: 0,
  facing: FACE_NORTH
};

var lastPoint = []; // x, y of whatever's in front of us, important for wallHistory
var wallHistory = [];

function updateCanvas(pointX, pointY) {
  // blank everything
  blankCanvas();
  // make a point for the drone
  drawCenterPoint('green');
  // draw the point in front of us
  drawAtPoint(pointX, pointY);
  // draw the wallHistory
  for(var i = 0; i < wallHistory.length; i++) {
    drawAtPoint(wallHistory[i][0], wallHistory[i][1]);
  }
}

const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const KEY_W = 119;
const KEY_A = 97;
const KEY_S = 115;
const KEY_D = 100;
function moveDrone(event) {
  console.log(event.keyCode);
  var currentX = drone.x;
  var currentY = drone.y;
  var currentFacing = drone.facing;
  var direction;
  switch(event.keyCode) {
    case KEY_LEFT:
    case KEY_A:
      drone.facing = FACE_WEST;
      drone.x -= 1;
      break;
    case KEY_UP:
    case KEY_W:
      drone.facing = FACE_NORTH;
      drone.y -= 1;
      break;
    case KEY_DOWN:
    case KEY_S:
      drone.facing = FACE_SOUTH;
      drone.y += 1;
      break;
    case KEY_RIGHT:
    case KEY_D:
      drone.facing = FACE_EAST;
      drone.x += 1;
      break;
    default: return;
  }

  var mustUpdateHistory = true;
  if(!isOnFloor(drone.x, drone.y)) {
    // we're outside the map, so reset the drone's x,y
    drone.x = currentX;
    drone.y = currentY;
    mustUpdateHistory = false;
  } 

  // if the facing changed: 1. Add the last
  // point to the wallHistory, and 2. check if the current
  // wallHistory already contains the point infront of us,
  // and remove it from the wallHistory
  var distance = distanceToWall(drone.x, drone.y, drone.facing);
  var distantPoint = findPointFromCenter(distance, drone.facing);
  if(drone.facing != currentFacing) { // did we change directions?
    wallHistory.push(lastPoint);
    if(mustUpdateHistory) {
      updateHistory();
      // Does the distantPoint == a point in history? If so, remove from history
      // JS doesn't provide an easy way of finding an array within an array,
      // so we have to do this the hard way with for loops
      for(var i = 0; i < wallHistory.length; i++) {
        if(wallHistory[i][0] == distantPoint[0] && wallHistory[i][1] == distantPoint[1]) {
          wallHistory.splice(i, 1);
        }
      }
    }
  } else if(mustUpdateHistory) {
    updateHistory();
  }
  lastPoint = distantPoint;
  updateCanvas(distantPoint[0], distantPoint[1]);
}

function updateHistory() {
  for(var i = 0; i < wallHistory.length; i++) {
    switch(drone.facing) {
      case FACE_WEST:
        wallHistory[i][0] += (1 * SCALE);
        break;
      case FACE_NORTH:
        wallHistory[i][1] += (1 * SCALE);
        break;
      case FACE_SOUTH:
        wallHistory[i][1] -= (1 * SCALE);
        break;
      case FACE_EAST:
        wallHistory[i][0] -= (1 * SCALE);
        break;
    }
  }
}
function findPointFromCenter(distance, direction) {
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
function startDrone(startingX, startingY) {
  drone.x = startingX;
  drone.y = startingY;
  drone.facing = FACE_NORTH;

  drawCenterPoint('green');

  // set up key events
  document.addEventListener('keypress', moveDrone);
} 
