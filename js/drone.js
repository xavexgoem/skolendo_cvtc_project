var drone = {
    x: 0,
    y: 0,
    facing: FACE_NORTH
};

function updateCanvas(pointX, pointY) {
  // blank everything
  blankCanvas();
  // make a point for the drone
  drawCenterPoint('green');
  // draw the point in front of us
  drawAtPoint(pointX, pointY);
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
  if(!isOnFloor(drone.x, drone.y)) {
    // we're outside the map, so reset the drone's x,y
    drone.x = currentX;
    drone.y = currentY;
  } else {
    
    // get the wall infront of us, add it to the history 
    var distance = distanceToWall(drone.x, drone.y, drone.facing);
    var distantPoint = findPointFromCenter(distance, drone.facing);
    updateCanvas(distantPoint[0], distantPoint[1]);
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
