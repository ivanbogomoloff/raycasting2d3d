function drawGrid() {
    ctx.strokeStyle = '#ccc';
    ctx.beginPath();
    var w = canvas.width / 50;
    var h = canvas.height / 50;
    var x = 0, y = 0;
    while (y <= canvas.height) {
        while (x <= canvas.width) {
            ctx.rect(x, y, w, h);
            x += w;
        }
        x = 0;
        y += h;
    }
    ctx.stroke();
}