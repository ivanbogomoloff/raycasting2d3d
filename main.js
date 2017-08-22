var canvas,
    ctx,
    map,
    cw2,
    ch2,
    logNum = 1,
    size = 4,
    player,
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