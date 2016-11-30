const DEBUG = false;
const FACE_NORTH = 1;
const FACE_EAST = 2;
const FACE_SOUTH = 3;
const FACE_WEST = 4;
function makeRandomRoom(x, y) {

    var width = randomInt(5, 20);
    var height = randomInt(5, 20);

    // for making passages, we want a common point where they all connect
    // to prevent a messy, passage-strewn map
    // passages will tend to overlap each other this way, which is fine

    var connectPointX = randomInt(x, x + width - 1);
    var connectPointY = randomInt(y, y + height - 1);

    return {
        x: x, 
        y: y, 
        connectPointX: connectPointX,
        connectPointY: connectPointY,
        width: width, 
        height: height,
        type: "room"
    };
}

function isIntersected(r1, r2) {
    
    var intersects = true;
    if(r1.x + r1.width < r2.x || r2.x + r2.width < r1.x) intersects = false;
    if(r1.y + r1.height < r2.y || r2.y + r2.height < r1.y) intersects = false;
    return intersects;
    
}

function makePassage(room1, room2) {
    var startX = room1.connectPointX;
    var startY = room1.connectPointY;
    var endX = room2.connectPointX;
    var endY = room2.connectPointY;

    // swap who starts and ends if necessary,
    // we always want the wide passage to start from left
    if(startX > endX) { 
        var swapX = startX;
        var swapY = startY;
        startX = endX;    
        endX = swapX;
        startY = endY;
        endY = swapY;
    }

    var passages = [];
    passages.push({x: startX, y: startY, width: endX - startX + 1, height: 1, type: "passage"});
    var passageEndX = endX;
    var passageEndY = startY;

    // do we start from the passageEnd x,y going down, or from the end point going down?
    if(passageEndY <= endY) {
        passages.push({x: passageEndX, y: passageEndY, width: 1, height: endY - passageEndY + 1, type: "passage"});
    } else {
        passages.push({x: endX, y: endY, width: 1, height: passageEndY - endY + 1, type: "passage"});
    }
    return passages;
}

function isInRoom(rooms, x, y) {
    for(var i = 0; i < rooms.length; i++) {
        var r = rooms[i];
        if(x >= r.x && x < r.x + r.width) {
            if(y >= r.y && y < r.y + r.height) {
                return true;
            }
        }
    }
    return false;
}

function isOnFloor(x, y) {
    return map.mapArray[(y * map.width) + x];
}

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

var map = {};
function makeMapArray(rooms, mapWidth, mapHeight) {
    

    // this is a 1d array for 2d data, containing values True or False
    // it's super important that accessing the array is done through
    // other functions, since 2d accessors won't work.
    var mapArray = new Array(mapWidth * mapHeight);
    for(var y = 0; y < mapHeight; y++) {
        var arrayColumn = mapWidth * y;
        for(var x = 0; x < mapWidth; x++) {
            mapArray[arrayColumn + x] = isInRoom(rooms, x, y);
        }
    }

    return mapArray;
}
/* Map generation procedure:
   1. Select random points on the map as room locations (top left corner)
   2. Make rooms of random height and width
   3. Test which rooms intersect and add them to a "grouping" of rooms
   4. Connect two groups and consolidate them into one group until there is 1 group left
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
    var largestX = 0;
    var largestY = 0;
    for(var i = 0; i < rooms.length; ++i) {
        if (rooms[i].x + rooms[i].width > largestX) {
            largestX = rooms[i].x + rooms[i].width;
        }
        if (rooms[i].y + rooms[i].height > largestY) {
            largestY = rooms[i].y + rooms[i].height;
        }
    }

    var roomGroups = [];
    for(var i = 0; i < rooms.length; i++) {
        // does this room intersect with any other room?
        // TODO - check if rooms[i] is already in a group
        // so we can just add to that one
        var thisGroup = [];
        for(var j = 0; j < rooms.length; j++) {
            // this will always AT LEAST add itself to a group
            // when i == j
            if(isIntersected(rooms[i], rooms[j])) {
                thisGroup.push(rooms[j]);
            }
        }
        roomGroups.push(thisGroup);
    }

    // connect the room groups
    // TODO - this should connect the nearest room, not some random room
    while(roomGroups.length > 1) {
        var indexGroup1 = Math.floor(Math.random() * roomGroups.length);
        var indexGroup2 = Math.floor(Math.random() * roomGroups.length);
        if(indexGroup1 == indexGroup2) continue; // that was a wash...
        var passage = makePassage(roomGroups[indexGroup1][0], roomGroups[indexGroup2][0]);
        rooms.push(passage[0]);
        rooms.push(passage[1]);
        roomGroups.splice(indexGroup2, 1);
    }

    // choose a random room as a starting point
    var startingRoom;
    while(true) {
        startingRoom = randomChoice(rooms);
        if(startingRoom.type != "passage") break;
    }

    // choose a random point within that room to be the starting location
    var startX = randomInt(startingRoom.x, startingRoom.x + startingRoom.width-1);
    var startY = randomInt(startingRoom.y, startingRoom.y + startingRoom.height-1);

    // find the room whose x,y is furthest from the starting xy
    var furthestRoom = startingRoom; // prime it so we have some room with distance
    furthestRoom.distance = 0;
    for(var i = 0; i < rooms.length; ++i) {
        if(rooms[i].type == "room") {
            // Pythagorean theorem to find distance between starting point
            // and our randomly-chosen room's x,y
            var sideA = startX - rooms[i].x;
            var sideB = startY - rooms[i].y;
            var distance = Math.sqrt(sideA * sideA + sideB * sideB);
            if (distance > furthestRoom.distance) {
                furthestRoom = rooms[i];
                furthestRoom.distance = distance;
            }
        }
    }

    // like with starting point, find a random point in this room to be our end point
    var endingX = randomInt(furthestRoom.x, furthestRoom.x + furthestRoom.width - 1);
    var endingY = randomInt(furthestRoom.y, furthestRoom.y + furthestRoom.height - 1);

    map.mapArray = makeMapArray(rooms, largestX, largestY);
    map.width = largestX;
    map.height = largestY;
    map.startX = startX;
    map.startY = startY;
    map.endX = endingX;
    map.endY = endingY;
    map.rooms = rooms;
}

function drawRooms(rooms) {
    for(var i = 0; i < rooms.length; i++) {
        drawRoom(rooms[i], 3);
    }
}
