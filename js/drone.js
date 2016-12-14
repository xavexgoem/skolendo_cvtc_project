var drone = {
  x: 0,
  y: 0,
  facing: FACE_NORTH
};

var lastPoint = []; // x, y of whatever's in front of us, important for wallHistory
var wallHistory = [];

// updates the canvas with the game's current state
// (Not sure whether this belongs in canvas.js,
// but since it's so specific to the drone, I figured
// it's best here...?)
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
  // finally, draw the status
  drawStatus(drone.x, drone.y, map.endX, map.endY);
}

const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const KEY_W = 87;
const KEY_A = 65;
const KEY_S = 83;
const KEY_D = 68;
function moveDrone(event) {
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
    default: return; // it wasn't one of our keys, do we won't move
  }

  var mustUpdateHistory = true; // flag to update history later. If the drone doesn't move, don't update.
  if(!isOnFloor(drone.x, drone.y)) {
    // we're outside the map, so reset the drone's x,y
    drone.x = currentX;
    drone.y = currentY;
    mustUpdateHistory = false; // we didn't move, so don't move anything in history
  } 

  // Are we at the end point?  If so, we win!
  if(drone.x == map.endX && drone.y == map.endY) {
    win();
    return;
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
      // since we'll be drawing that point independently
      for(var i = 0; i < wallHistory.length; i++) {
        if(wallHistory[i][0] == distantPoint[0] && wallHistory[i][1] == distantPoint[1]) {
          wallHistory.splice(i, 1); // remove 1 element at index i
          break;
        }
      }
    }
  } else if(mustUpdateHistory) {
    updateHistory();
  }
  lastPoint = distantPoint;
  updateCanvas(distantPoint[0], distantPoint[1]);
}

// Moves every point in wallHistory opposite the direction we moved
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

// given a point's distance from us and the direction it is from us,
// return the x,y of that point relative to the canvas's center.
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
  drawStatus(drone.x, drone.y, map.endX, map.endY);

  // set up key events
  document.addEventListener('keydown', moveDrone);
} 

function win() { 
  // unbind keyboard events
  document.removeEventListener('keydown', moveDrone);
  drawWin();
}
