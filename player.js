function initPlayer() {
    player = {
        x: 296,
        y: 44,
        radius: 10,
        pov_radius: function () {
            return canvas.width + canvas.height;
        },
        pov_angle: -90,
        pov: {x: 0, y: 0},
        dir: {x: 0, y: 0},
        fov1: [],
        fov2: [],
        rotate_angle_step: 30,
        fov_angle_h: 40,
        fov_angle_step: 7,
        debug: false
    };

    rotatePlayer();
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


function calcPov() {
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
}

function calcDir() {
    //direction
    player.dir.x = player.pov.x - player.x;
    player.dir.y = player.pov.y - player.y;
}

function calcFov() {
    player.fov1 = [];
    player.fov2 = [];
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
        angle -= player.fov_angle_step;
        angle2 += player.fov_angle_step;
    }
}

function calcColFov(p1, p2, playerPoint, fovPoint1, wallLine) {

    if (isCrossing(p1, p2, playerPoint, fovPoint1)) {
        var fovLine = lineEquation(playerPoint, fovPoint1);
        var fovCp = getCrossingPoint(
            wallLine.A,
            wallLine.B,
            wallLine.C,
            fovLine.A,
            fovLine.B,
            fovLine.C
        );

        var distance = Math.abs(fovCp.X - playerPoint.X) + Math.abs(fovCp.Y - playerPoint.Y);

        return {
            x: fovCp.X,
            y: fovCp.Y,
            fp_x: fovPoint1.X,
            fp_y: fovPoint1.Y,
            dist: distance
        };
    }

    return false;
}

function calcMapFov() {
    var pFovAr1 = player.fov1;
    var pFovAr2 = player.fov2;

    player.fov1 = [];
    player.fov2 = [];
    var playerPoint = new Point(player.x, player.y);
    var playerPov = new Point(player.pov.x, player.pov.y);
    var rayPoint;
    //tmp vars
    var fovLine, crossPoint, distance, pfv;
    for (var i in pFovAr1) {
        rayPoint = new Point(pFovAr1[i].x, pFovAr1[i].y);
        iterateMapBlocks(function (px1, py1, px2, py2) {
            var p1 = new Point(px1, py1);
            var p2 = new Point(px2, py2);
            var wallLine = lineEquation(p1, p2);
            crossPoint = calcColFov(p1, p2, playerPoint, rayPoint, wallLine);
            if (crossPoint) {
                player.fov1.push(crossPoint);
            }
        });
    }

    for (var i in pFovAr2) {
        var fovPoint1 = new Point(pFovAr2[i].x, pFovAr2[i].y);
        iterateMapBlocks(function (px1, py1, px2, py2) {
            var p1 = new Point(px1, py1);
            var p2 = new Point(px2, py2);
            var wallLine = lineEquation(p1, p2);
            crossPoint = calcColFov(p1, p2, playerPoint, fovPoint1, wallLine);
            if (crossPoint) {
                player.fov2.push(crossPoint);
            }
        });
    }

    player.fov1.sort(function (a, b) {
        return a.dist - b.dist;
    });

    player.fov2.sort(function (a, b) {
        return a.dist - b.dist;
    });


    for(var i = 0; i < player.fov1.length; i++) {
        var cur = player.fov1[i];
        console.log(cur);
        for(var n = i + 1; n < player.fov1.length; n++) {
            var cur2 = player.fov1[n];
            if(cur2 && cur && cur2.fp_x == cur.fp_x && cur2.fp_y == cur.fp_y) {
                delete  player.fov1[n];
            }
        }
    }

    for(var i = 0; i < player.fov2.length; i++) {
        var cur = player.fov2[i];
        for(var n = i + 1; n < player.fov2.length; n++) {
            var cur2 = player.fov2[n];
            if(cur2 && cur && cur2.fp_x == cur.fp_x && cur2.fp_y == cur.fp_y) {
                delete  player.fov2[n];
            }
        }
    }


    //if (isCrossing(p1, p2, playerPoint, playerPov)) {
    //    fovLine = lineEquation(playerPoint, playerPov);
    //    fovCp = getCrossingPoint(
    //        wallLine.A,
    //        wallLine.B,
    //        wallLine.C,
    //        fovLine.A,
    //        fovLine.B,
    //        fovLine.C
    //    );
    //
    //
    //    player.pov.x = fovCp.X;
    //    player.pov.y = fovCp.Y;
    //}

}

function rotatePlayer() {
    calcPov();
    calcDir();
    calcFov();
    calcMapFov();

    log('player pov: ' + player.pov.x + ' ' + player.pov.y);
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

        // DEBUG
        if(player.debug) {

            ctx.fillStyle = 'red';
            ctx.fillText(player.fov1[i].x+','+ player.fov1[i].y, player.fov1[i].x+13, player.fov1[i].y+13);
            ctx.fillStyle = 'green';
        }
    }
    ctx.stroke();

    ctx.beginPath();
    for (var i in player.fov2) {
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(player.fov2[i].x, player.fov2[i].y);

        if(player.debug) {
            ctx.fillStyle = 'red';
            ctx.fillText(player.fov2[i].x+','+ player.fov2[i].y, player.fov2[i].x+13, player.fov2[i].y+13);
            ctx.fillStyle = 'green';
        }

    }
    ctx.stroke();
    //player pov
    ctx.fillStyle = ctx.strokeStyle = 'purple';
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(player.pov.x, player.pov.y);
    ctx.stroke();

}