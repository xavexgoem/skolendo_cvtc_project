var drone = {
    x: 0,
    y: 0,
    facing: FACE_NORTH
};

var historyLength = 10;
var rangeHistory = [];

function updateCanvas() {
  // 
}

function startDrone(startingX, startingY) {
    drone.x = startingX;
    drone.y = startingY;
    drone.facing = FACE_NORTH;

    drone.drawCenterPoint('green');
