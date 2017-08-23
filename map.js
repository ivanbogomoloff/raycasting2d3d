function initMap() {
    map = [
        // ROOM WALLS
        //  x1  y1  x2    y2
        0, 0, mapSize.w, 0,
        0, 0, 0, mapSize.h,
        mapSize.w, 0, mapSize.h, mapSize.h,
        0, mapSize.h, mapSize.w, mapSize.h,
        // ROOM WALLS LIKE THINGS
        mapSize.w2 - 100, mapSize.h2 - 100, mapSize.w2 + 100, mapSize.h2 - 100,
        mapSize.w2 + 100, mapSize.h2 - 100, mapSize.w2 + 100, mapSize.h2 + 20,
        mapSize.w2 + 100, mapSize.h2+ 20, mapSize.w2 - 100, mapSize.h2 - 100,
        // ROOM WALL DIAGONAL
    ];

    for(var i in map) {
        if(map[i] != 0) {
            map[i] = map[i] * mapRatio.wh;
        }
    }
}

function iterateMapBlocks(func) {
    var block = 0;
    while (block < map.length) {
        func(map[block], map[block + 1], map[block + 2], map[block + 3]);
        block += size;
    }
}

function drawMap() {
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    iterateMapBlocks(function (px1, py1, px2, py2) {
        ctx.beginPath();
        ctx.moveTo(px1, py1);
        ctx.lineTo(px2, py2);
        ctx.stroke();
    });
    ctx.closePath();
    ctx.lineWidth = 1;
}