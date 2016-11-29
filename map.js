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
    // select a random point in each room:
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
        if(x >= r.x && x <= r.x + r.width) {
            if(y >= r.y && y <= r.y + r.height) {
                return true;
            }
        }
    }
    return false;
}

function distanceToNearestWall(fromX, fromY, angle) {
    // construct a vector 

    var vecX = Math.cos(angle);
    var vecY = Math.sin(angle);
    //drawRoom({x: vecX, y: vecY, height: 1, width: 1}, 3, 150);

    var distance = 1;
    const MOVING_BY = 1;
    while(true) {
        var modX = fromX + (vecX * distance);
        var modY = fromY + (vecY * distance);
        if(!atMap(modX, modY)) {
            modX = fromX + (vecX * (distance));
            modY = fromY + (vecY * (distance));
            break;
        }
        distance += MOVING_BY;
    }
    drawRoom({x: modX, y: modY, height:1, width: 1},3,200);
    return [modX, modY];
}

function atMap(x, y) {
    // NOTE - the map is arranged y, x
    return mapArray[Math.round(y)][Math.round(x)];
}

var mapArray = [];
function makeMapArray(rooms) {
    // find boundaries of the map
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

    var imgArray = new Uint8ClampedArray(largestX * largestY * 4);
    var index = 0;
    for(var y = 0; y < largestY; ++y) {
        var column = [];
        for(var x = 0; x < largestX; ++x) {
            // is (x,y) located in any room?
            if(isInRoom(rooms, x, y)) {
                column.push(true);
                imgArray[index] = 255;
                imgArray[index + 1] = 255;
                imgArray[index + 2] = 255;
                imgArray[index + 3] = 255;
            } else {
                column.push(false);
                imgArray[index] = 0;
                imgArray[index + 1] = 0;
                imgArray[index + 2] = 0;
                imgArray[index + 3] = 255;
            }
            index += 4;
        }
        mapArray.push(column);
    }

    console.log(imgArray);
    var imgData = new ImageData(imgArray, largestX, largestY);
    var canvas = document.getElementById('canvas2').getContext('2d');
    canvas.putImageData(imgData, 0, 0);


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
        var roomX = randomInt(1, 75);
        var roomY = randomInt(1, 75);
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

    for(var i = 0; i < rooms.length; ++i) {
        drawRoom(rooms[i], 3);
    }

    // choose a random room as a starting point
    var startingRoom;
    while(true) {
        startingRoom = randomChoice(rooms);
        if(startingRoom.type != "passage") break;
    }

    var startingPointX = randomInt(startingRoom.x, startingRoom.x + startingRoom.width-1);
    var startingPointY = randomInt(startingRoom.y, startingRoom.y + startingRoom.height-1);

    // TEST
    startingXY.push(startingPointX, startingPointY);


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
}
var startingXY = [];
