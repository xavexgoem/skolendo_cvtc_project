const FACE_NORTH = 1;
const FACE_EAST = 2;
const FACE_SOUTH = 3;
const FACE_WEST = 4;

var drone = {
    x: 0,
    y: 0,
    facing: FACE_NORTH
}

function startDrone(startingX, startingY) {
    drone.x = startingX;
    drone.y = startingY;
    drone.facing = FACE_NORTH;
