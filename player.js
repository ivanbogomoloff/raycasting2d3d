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
    );

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