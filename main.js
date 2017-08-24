var canvas,
    ctx,
    map,
    cw2,
    ch2,
    logNum = 1,
    size = 4,
    player,
    mapSize = {w: 800, h: 600, w2: 400, h2: 400},
    mapRatio = {w: 1, h: 1, wh: 1},
    enableHide = true,
    enableConsole = true;

function main() {
    //inits
    initCanvas();
    initMap();
    initPlayer();

    //events
    initEvents();
    render();
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawMap();
    drawPlayer();
}

function initCanvas() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    cw2 = canvas.width / 2;
    ch2 = canvas.height / 2;

    mapRatio.w = canvas.width / mapSize.w;
    mapRatio.h = canvas.height / mapSize.h;
    mapRatio.wh = canvas.width / mapSize.w;

    mapSize.w2  = mapSize.w / 2;
    mapSize.h2  = mapSize.h / 2;

}

function log(msg, color) {
    if (enableConsole) {
        console.log(msg);
        return;
    }

    if (color == undefined || color == '') {
        color = '#000';
    }

    var logger = document.getElementById('logger');
    if (typeof(msg) == 'object') {
        msg = JSON.stringify(msg);
    }
    logger.innerHTML += '<p style="color: ' + color + '">[' + logNum + ']. ' + msg + '</p>';
    logNum++;
}