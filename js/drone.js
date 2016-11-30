var drone = {
    x: 0,
    y: 0,
    facing: FACE_NORTH
};

var historyLength = 10;
var rangeHistory = [];

function updateCanvas() {
  // blank everything
  blankCanvas();
  // make a point for the drone
  drawCenterPoint('green');
  // draw everything from the history
  for(var i = 0; i < rangeHistory.length; i++) {
    var histX = rangeHistory[i].x;
    var histY = rangeHistory[i].y;
    drawAtPoint(histX, histY, "black");
  }

}

function updateHistory(direction) {
  var moveX, moveY;
  switch(direction) {
    case FACE_NORTH:
      moveX = 1; moveY = 0; break;
    case FACE_SOUTH:
      moveX = -1; moveY = 0; break;
    case FACE_WEST:
      moveX = 1; moveY = 0; break;
    case FACE_EAST:
      moveX = -1; moveY = 0; break;
  }
  
  // NOTE - this starts at index 1, since
  // the first index will always be the item
  // we just added; no change is necessary;
  for(var i = 1; i < rangeHistory.length; i++) {
    rangeHistory[i].x += moveX;
    rangeHistory[i].y += moveY;
  }
}

const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const KEY_W = 87;
const KEY_A = 97;
const KEY_S = 83;
const KEY_D = 68;
function moveDrone(event) {
  var currentX = drone.x;
  var currentY = drone.y;
  var direction;
  switch(event.keyCode) {
    case KEY_LEFT:
    case KEY_A:
      direction = FACE_WEST;
      drone.x -= 1;
      break;
    case KEY_UP:
    case KEY_W:
      direction = FACE_NORTH;
      drone.y -= 1;
      break;
    case KEY_DOWN:
    case KEY_S:
      direction = FACE_SOUTH;
      drone.y += 1;
      break;
    case KEY_RIGHT:
    case KEY_D:
      direction = FACE_EAST;
      drone.x += 1;
      break;
    default: return;
  }
  console.log('here');
  if(!isOnFloor(drone.x, drone.y)) {
    // we're outside the map, so reset the drone's x,y
    console.log('in a wall?');
    drone.x = currentX;
    drone.y = currentY;
  } else {
    
    // get the wall infront of us, add it to the history 
    var distance = distanceToWall(drone.x, drone.y, drone.facing);
    var distantPoint = drawPointFromCenter(distance, drone.facing);
    var newHist = {x: distantPoint[0], y: distantPoint[1]};
    rangeHistory.unshift(newHist);
    updateHistory(direction);
    updateCanvas();
  }
}

function startDrone(startingX, startingY) {
  drone.x = startingX;
  drone.y = startingY;
  drone.facing = FACE_NORTH;

  drawCenterPoint('green');

  // set up key events
  document.addEventListener('keypress', moveDrone);
} 
