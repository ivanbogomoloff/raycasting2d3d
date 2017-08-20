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

function movePlayerForward() {
    var rp = rotatePoint(
        10,
        10,
        player.x,
        player.y,
        player.pov_angle
    );

    player.x = rp.x;
    player.y = rp.y;
}

function movePlayerBackward() {
    var rp = rotatePoint(
        10,
        10,
        player.x,
        player.y,
        player.pov_angle + 180
    );

    player.x = rp.x;
    player.y = rp.y;
}

function rotatePlayer() {
    var rp = rotatePoint(
        player.pov_radius(),
        player.pov_radius(),
        player.x,
        player.y,
        player.pov_angle
    );
    //point of view
    player.pov.x = rp.x;
    player.pov.y = rp.y;
    //direction
    player.dir.x = rp.x - player.x;
    player.dir.y = rp.y - player.y;
    //field of view
    var angle = player.pov_angle + player.fov_angle_h;
    var angle2 = player.pov_angle - player.fov_angle_h;
    while (angle >= player.pov_angle) {
        var pFov = rotatePoint(
            player.pov_radius(),
            player.pov_radius(),
            player.x,
            player.y,
            angle
        );
        player.fov1.push(pFov);
        var pFov2 = rotatePoint(
            player.pov_radius(),
            player.pov_radius(),
            player.x,
            player.y,
            angle2
        );
        player.fov2.push(pFov2);
        angle -= 1;
        angle2 += 1;
    }

    var pFovAr1 = player.fov1;
    var pFovAr2 = player.fov2;

    player.fov1 = [];
    player.fov2 = [];
    iterateMapBlocks(function (px1, py1, px2, py2, pxSize) {
            var p1 = new Point(px1, py1);
            var p2 = new Point(px2, py2);

            var playerPoint = new Point(player.x, player.y);
            var playerPov = new Point(player.pov.x, player.pov.y);
            var wallLine = lineEquation(p1, p2);
            //tmp vars
            var fovLine, fovCp, distance, pfv;
            for (var i in pFovAr1) {
                var fovPoint1 = new Point(pFovAr1[i].x, pFovAr1[i].y);
                if (isCrossing(p1, p2, playerPoint, fovPoint1)) {
                    fovLine = lineEquation(playerPoint, fovPoint1);
                    fovCp = getCrossingPoint(
                        wallLine.A,
                        wallLine.B,
                        wallLine.C,
                        fovLine.A,
                        fovLine.B,
                        fovLine.C
                    );

                    distance = Math.abs(fovCp.X - player.x) + Math.abs(fovCp.Y - player.y);

                    if (player.fov1.length > 0) {
                        pfv = player.fov1;
                        for (var n in pfv) {
                            if (player.fov1[n].fp_x == fovPoint1.X && player.fov1[n].fp_y == fovPoint1.Y) {
                                if (distance <= player.fov1[n].dist) {
                                    //player.fov1.splice(0, n); or
                                    delete player.fov1[n];
                                }
                            }
                        }
                    }

                    player.fov1.push({
                        x: fovCp.X,
                        y: fovCp.Y,
                        fp_x: fovPoint1.X,
                        fp_y: fovPoint1.Y,
                        dist: distance
                    });
                }
            }

            for (var i in pFovAr2) {
                var fovPoint2 = new Point(pFovAr2[i].x, pFovAr2[i].y);
                if (isCrossing(p1, p2, playerPoint, fovPoint2)) {
                    fovLine = lineEquation(playerPoint, fovPoint2);
                    fovCp = getCrossingPoint(
                        wallLine.A,
                        wallLine.B,
                        wallLine.C,
                        fovLine.A,
                        fovLine.B,
                        fovLine.C
                    );

                    distance = Math.abs(fovCp.X - player.x) + Math.abs(fovCp.Y - player.y);

                    if (player.fov2.length > 0) {
                        pfv = player.fov2;
                        for (var n in pfv) {
                            if (player.fov2[n].fp_x == fovPoint2.X && player.fov2[n].fp_y == fovPoint2.Y) {
                                if (distance <= player.fov2[n].dist) {
                                    delete player.fov2[n];
                                }
                            }
                        }
                    }

                    player.fov2.push({
                        x: fovCp.X,
                        y: fovCp.Y,
                        fp_x: fovPoint2.X,
                        fp_y: fovPoint2.Y,
                        dist: distance
                    });
                }
            }

            if (isCrossing(p1, p2, playerPoint, playerPov)) {
                fovLine = lineEquation(playerPoint, playerPov);
                fovCp = getCrossingPoint(
                    wallLine.A,
                    wallLine.B,
                    wallLine.C,
                    fovLine.A,
                    fovLine.B,
                    fovLine.C
                );


                player.pov.x = fovCp.X;
                player.pov.y = fovCp.Y;
            }
        }
    )
    ;

    log('player pov: ' + player.pov.x + ' ' + player.pov.y);
}

function initPlayer() {
    player = {
        x: cw2 - 50,
        y: ch2 + 40,
        radius: 10,
        pov_radius: function () {
            return canvas.width + canvas.height;
        },
        pov_angle: 0,
        pov: {x: 0, y: 0},
        dir: {x: 0, y: 0},
        fov1: [],
        fov2: [],
        rotate_angle_step: 30,
        fov_angle_h: 40,
        intersections: {
            fov: [],
            pov: []
        }
    };

    rotatePlayer();
}

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

function initEvents() {
    document.getElementById('f').addEventListener('click', function () {
        movePlayerForward();
        rotatePlayer();
        render();
    });

    document.getElementById('l').addEventListener('click', function () {
        player.pov_angle += player.rotate_angle_step;
        if (player.pov_angle >= 360) {
            player.pov_angle = 0;
        }

        rotatePlayer();
        render();
    });

    document.getElementById('r').addEventListener('click', function () {
        player.pov_angle -= player.rotate_angle_step;
        if (player.pov_angle <= -360) {
            player.pov_angle = 0;
        }
        rotatePlayer();
        render();
    });

    window.addEventListener('keydown', function (e) {
        //left
        if (e.keyCode == 37) {
            player.pov_angle += player.rotate_angle_step;
            if (player.pov_angle >= 360) {
                player.pov_angle = 0;
            }

            rotatePlayer();
            render();
        }
        // right
        else if (e.keyCode == 39) {
            player.pov_angle -= player.rotate_angle_step;
            if (player.pov_angle <= -360) {
                player.pov_angle = 0;
            }
            rotatePlayer();
            render();
        }
        // up-forward
        else if (e.keyCode == 38) {
            movePlayerForward();
            rotatePlayer();
            render();
        }
        else if (e.keyCode == 40) {
            movePlayerBackward();
            rotatePlayer();
            render();
        }
        console.log(e.keyCode);
    });

}

function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function drawPlayer() {
//player body
    ctx.fillStyle = ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.arc(
        player.x,
        player.y,
        player.radius,
        0,
        2 * Math.PI
    );
    ctx.fill();
//player fov
    ctx.fillStyle = ctx.strokeStyle = 'green';
    ctx.beginPath();
    for (var i in player.fov1) {
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(player.fov1[i].x, player.fov1[i].y);
    }
    ctx.stroke();

    ctx.beginPath();
    for (var i in player.fov2) {
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(player.fov2[i].x, player.fov2[i].y);
    }
    ctx.stroke();
    //player pov
    ctx.fillStyle = ctx.strokeStyle = 'purple';
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(player.pov.x, player.pov.y);
    ctx.stroke();

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

function rotatePoint(x, y, ox, oy, angle) {
    var s = Math.sin(deg2rad(angle));
    var c = Math.cos(deg2rad(angle));

    return {
        x: Math.ceil(ox + x * c),
        y: Math.ceil(oy - y * s)
    };
}

function deg2rad(deg) {
    return (Math.PI / 180) * deg;
}

function initCanvas() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    cw2 = canvas.width / 2;
    ch2 = canvas.height / 2;
}

function vectorMulti(ax, ay, bx, by) {
    return ax * by - bx * ay;
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