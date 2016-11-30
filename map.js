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

function atMap(x, y) {
    return map.mapArray[(y * map.width) + x];
}

function findNearestWall(x, y, direction) {
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
    while(atMap(x, y)) {
        x += moveX;
        y += moveY; 
        console.log(y);
    }
    // the result of that will be off by one, so:
    x -= moveX;
    y -= moveY;

    drawRoom({x:x,y:y,height:1,width:1},3,200);
}

var map = {};
function makeMapArray(rooms) {
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

    // this is a 1d array for 2d data, containing values True or False
    // it's super important that accessing the array is done through
    // other functions, since 2d accessors won't work.
    var mapArray = new Array(largestX * largestY);
    for(var y = 0; y < largestY; y++) {
        var arrayColumn = largestX * y;
        for(var x = 0; x < largestX; x++) {
            mapArray[arrayColumn + x] = isInRoom(rooms, x, y);
        }
    }

    // For debugging purposes, we want to make sure that the representation
    // we set up is accurate to what we've already drawn
    var canvasArray = new Uint8ClampedArray(largestX * largestY * 4);
    for(i = 0; i < mapArray.length; i++) {
        if(mapArray[i] === true) {
            canvasArray[(i * 4)] = 0;
            canvasArray[(i * 4) +1] = 0;
            canvasArray[(i * 4) +2] = 0;
            canvasArray[(i * 4) +3] = 255;
        } else {
            canvasArray[(i * 4)] = 255;
            canvasArray[(i * 4) +1] = 255;
            canvasArray[(i * 4) +2] = 255;
            canvasArray[(i * 4) +3] = 255;
        }
    }
    var imgData = new ImageData(canvasArray, largestX, largestY);
    var context = document.getElementById('canvas').getContext('2d');
    context.putImageData(imgData, 0, 0);

    map.mapArray = mapArray;
    map.width = largestX;
    map.height = largestY;
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

    var startingPointX = randomInt(startingRoom.x, startingRoom.x + startingRoom.width-1);
    var startingPointY = randomInt(startingRoom.y, startingRoom.y + startingRoom.height-1);
    drawRoom({x: startingPointX, y: startingPointY, width: 1, height: 1}, 3, 100);        
    // find the room whose x,y is furthest from the starting xy
    var furthestRoom = startingRoom;
    furthestRoom.distance = 0;
    for(var i = 0; i < rooms.length; ++i) {
        if(rooms[i].type == "room") {
            var sideA = startingPointX - rooms[i].x;
            var sideB = startingPointY - rooms[i].y;
            var distance = Math.sqrt(sideA * sideA + sideB * sideB); // Pythagora
            if (distance > furthestRoom.distance) {
                furthestRoom = rooms[i];
                furthestRoom.distance = distance;
            }
        }
    }

    var endingX = randomInt(furthestRoom.x, furthestRoom.x + furthestRoom.width - 1);
    var endingY = randomInt(furthestRoom.y, furthestRoom.y + furthestRoom.height - 1);

    drawRoom({x: endingX, y: endingY, width: 1, height: 1}, 3, 200);
    makeMapArray(rooms);
    map.startX = startingPointX;
    map.startY = startingPointY;
    map.rooms = rooms;
}

function drawRooms(rooms) {
    for(var i = 0; i < rooms.length; i++) {
        drawRoom(rooms[i], 1, 100);
    }
}
