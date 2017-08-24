function initMap() {
    console.log(mapSize);
    map = [
        // ROOM WALLS
        //  x1  y1  x2    y2
        0, 0, mapSize.w * mapRatio.w, 0,
        0, 0, 0, mapSize.h * mapRatio.h,
        mapSize.w * mapRatio.w, 0, mapSize.w * mapRatio.w, mapSize.h * mapRatio.h,
        0, mapSize.h * mapRatio.h , mapSize.w * mapRatio.w, mapSize.h * mapRatio.h,
        // ROOM WALLS LIKE THINGS
        mapSize.w2 * mapRatio.w - 100, mapSize.h2 * mapRatio.h - 100, mapSize.w2 * mapRatio.w + 100, mapSize.h2 * mapRatio.h - 100,
        mapSize.w2 * mapRatio.w + 100, mapSize.h2 * mapRatio.h - 100, mapSize.w2 * mapRatio.w + 100, mapSize.h2 * mapRatio.h + 20,
        mapSize.w2 * mapRatio.w + 100, mapSize.h2 * mapRatio.h + 20, mapSize.w2 * mapRatio.w - 100, mapSize.h2 * mapRatio.h - 100,
        // ROOM WALL DIAGONAL
    ];
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