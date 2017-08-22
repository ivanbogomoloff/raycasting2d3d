function initMap() {
    map = [
        // ROOM WALLS
        //  x1  y1  x2    y2
        0, 0, canvas.width, 0,
        0, 0, 0, canvas.height,
        canvas.width, 0, canvas.width, canvas.height,
        0, canvas.height, canvas.width, canvas.height,
        // ROOM WALLS LIKE THINGS
        cw2 - 100, ch2 - 100, cw2 + 100, ch2 - 100,
        cw2 + 100, ch2 - 100, cw2 + 100, ch2 + 20,
        // ROOM WALL DIAGONAL
        //cw2 - 200, ch2 + 30, cw2 , ch2 + 140, 20
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