const FACE_NORTH = 1;
const FACE_EAST = 2;
const FACE_SOUTH = 3;
const FACE_WEST = 4;
var map = {};

// This is more of a convenience constructor - we have a lot of
// functions that need to return a room object, and this removes
// a lot of {object_creation: overhead}, while keeping things consistent
function Room(x, y, width, height, type, connectX, connectY) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.type = type;

  // these have defaults after the ||, if they're not passed (like for passages)
  this.connectPointX = connectX || undefined;
  this.connectPointY = connectY || undefined;
}

// makes a room of random width and height whose top-left corner is at x,y
// Returns the room
function makeRandomRoom(x, y) {
  var width = randomInt(5, 20);
  var height = randomInt(5, 20);

  // when making passages, we want a common point where they all connect
  // per room to prevent a messy, passage-strewn map.
  // Passages will tend to overlap with this method, which is fine
  var connectPointX = randomInt(x, x + width - 1);
  var connectPointY = randomInt(y, y + height - 1);

  return new Room(x, y, width, height, 'room', connectPointX, connectPointY);
}

// Tests if two rooms intersect each other
function isIntersected(r1, r2) {
  var intersects = true;
  if(r1.x + r1.width < r2.x || r2.x + r2.width < r1.x) intersects = false;
  if(r1.y + r1.height < r2.y || r2.y + r2.height < r1.y) intersects = false;
  return intersects;
}

// Tests whether a point x,y is in any of the rooms we pass into the function
function isPointInRoom(rooms, x, y) {
  var inRoom = false;
  for(var i = 0; i < rooms.length; i++) {
    var r = rooms[i];
    if(x >= r.x && x < r.x + r.width) {
      if(y >= r.y && y < r.y + r.height) {
        inRoom = true;
      }
    }
  }
  return inRoom;
}

// Tests whether point x,y is in a room or in a wall
// (this can maybe be removed, since isPointInRoom covers this
// difference being that this tests the mapArray, and isInPointInRoom
// tests rooms. But it might be handy later, if we have different
// values in the mapArray other than True and False)
function isOnFloor(x, y) {
  return map.mapArray[(y * map.width) + x];
}

// makes a passage between two rooms
// returns an array of two passages
function makePassage(room1, room2) {
  var startX = room1.connectPointX;
  var startY = room1.connectPointY;
  var endX = room2.connectPointX;
  var endY = room2.connectPointY;

  // swap who starts and ends if necessary,
  // we always want the passage to start
  // from the left going right (this avoids a lot
  // of logic we'd need otherwise)
  if(startX > endX) { 
    var swapX = startX;
    var swapY = startY;
    startX = endX;    
    endX = swapX;
    startY = endY;
    endY = swapY;
  }

  var passages = [new Room(startX, startY, endX - startX + 1, 1, 'passage')];

  // the end point of the initial passage is always directly above or below the end point, so
  // y never changes, and x is always the end point's x
  var passageEndX = endX;
  var passageEndY = startY;

  // this ensures that we're always building the passage DOWN and not up.  If the end point's y is 
  // above the passage's y, build from the end point down to the passage
  if(passageEndY <= endY) {
    passages.push(new Room(passageEndX, passageEndY, 1, endY - passageEndY + 1, 'passage'));
  } else {
    passages.push(new Room(endX, endY, 1, passageEndY - endY + 1, 'passage'));
  }
  return passages;
}

// Returns the distance from point x,y to a wall given a certain direction
function distanceToWall(x, y, direction) {
  var moveX, moveY;
  switch(direction) {
    case FACE_NORTH:
      moveX = 0; moveY = -1; break;
    case FACE_SOUTH:
      moveX = 0; moveY = 1; break;
    case FACE_EAST:
      moveX = 1; moveY = 0; break;
    case FACE_WEST:
      moveX = -1; moveY = 0; break;
  }

  // Keep moving x,y until we're in a wall
  var distance = 0;
  do {
    x += moveX;
    y += moveY; 
    distance += 1;
  } while(isOnFloor(x, y));
  // the result of that will be off by one, since we exit the loop
  // when we're IN a wall, so:
  x -= moveX;
  y -= moveY;

  return distance;
}

/*  Map generation procedure:
 *  1. Select random points on the map as room locations (top left corner)
 *  2. Make rooms of random height and width
 *  3. Test which rooms intersect and add them to a "grouping" of rooms
 *  4. Connect two groups and consolidate them into one group until there is 1 group left
 */
function makeMap() {
  var numRooms = randomInt(4, 8);
  var rooms = [];
  for(var i = 0; i < numRooms; ++i) {
    var roomX = randomInt(0, 75);
    var roomY = randomInt(0, 75);
    rooms.push(makeRandomRoom(roomX, roomY));    
  }

  // Get the width and height of the map
  map.width = 0; map.height = 0;
  for(var i = 0; i < rooms.length; ++i) {
    if (rooms[i].x + rooms[i].width > map.width) {
      map.width = rooms[i].x + rooms[i].width;
    }
    if (rooms[i].y + rooms[i].height > map.height) {
      map.height = rooms[i].y + rooms[i].height;
    }
  }

  var roomGroups = [];
  for(var i = 0; i < rooms.length; i++) {
    // does this room intersect with any other room?
    // this is not perfect - if rooms[i] is already part of a group,
    // it won't catch that.  
    var thisGroup = [];
    for(var j = 0; j < rooms.length; j++) {
      // this will always AT LEAST add itself to a new group
      // when i == j, which we want
      if(isIntersected(rooms[i], rooms[j])) {
        thisGroup.push(rooms[j]);
      }
    }
    roomGroups.push(thisGroup);
  }

  // connect the room groups haphazardly
  while(roomGroups.length > 1) {
    var indexGroup1 = Math.floor(Math.random() * roomGroups.length);
    var indexGroup2 = Math.floor(Math.random() * roomGroups.length);
    if(indexGroup1 == indexGroup2) continue; // don't want to connect a group to itself...
    var passage = makePassage(roomGroups[indexGroup1][0], roomGroups[indexGroup2][0]);
    rooms.push(passage[0]);
    rooms.push(passage[1]);
    roomGroups.splice(indexGroup2, 1);
  }

  // choose a random room as a starting point
  var startingRoom;
  do {
    startingRoom = randomChoice(rooms);
  } while(startingRoom.type != "passage");

  // choose a random point within that room to be the starting location
  map.startX = randomInt(startingRoom.x, startingRoom.x + startingRoom.width-1);
  map.startY = randomInt(startingRoom.y, startingRoom.y + startingRoom.height-1);

  // find the room whose x,y is furthest from the starting xy
  var furthestRoom = startingRoom; 
  furthestRoom.distance = 0; // prime it so we have some room with distance
  for(var i = 0; i < rooms.length; i++) {
    if(rooms[i].type == "room") {
      // Pythagorean theorem to find distance between starting point
      // and our randomly-chosen room's x,y
      var sideA = map.startX - rooms[i].x;
      var sideB = map.startY - rooms[i].y;
      var distance = Math.sqrt(sideA * sideA + sideB * sideB);
      if (distance > furthestRoom.distance) {
        furthestRoom = rooms[i];
        furthestRoom.distance = distance;
      }
    }
  }

  // like with starting point, find a random point in this room to be our end point
  map.endX = randomInt(furthestRoom.x, furthestRoom.x + furthestRoom.width - 1);
  map.endY = randomInt(furthestRoom.y, furthestRoom.y + furthestRoom.height - 1);

  // make an array of the entire map of true/false (floor/wall) values
  map.mapArray = makeMapArray(rooms, map.width, map.height);
}

function makeMapArray(rooms, mapWidth, mapHeight) {

  // This is a 1d array of a 2d area, which is useful when we want to draw image data
  // directly to the canvas, the functions for which require the use of a 1d array.
  // values are True if we're in a room, else False
  var mapArray = new Array(mapWidth * mapHeight);
  for(var y = 0; y < mapHeight; y++) {
    var arrayColumn = mapWidth * y;
    for(var x = 0; x < mapWidth; x++) {
      mapArray[arrayColumn + x] = isPointInRoom(rooms, x, y);
    }
  }

  return mapArray;
}
