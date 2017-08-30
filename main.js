var rotatePoint = function(x, y, ox, oy, angle) {
    var s = Math.sin(deg2rad(angle));
    var c = Math.cos(deg2rad(angle));

    return {
        x: Math.ceil(ox + x * c),
        y: Math.ceil(oy - y * s)
    };
};

var deg2rad = function (deg) {
    return (Math.PI / 180) * deg;
};
var isDebugTiles = isDebugCollider = isDebugColliderLines = false;
document.getElementById('tiles_debug').addEventListener('click', function() {
    isDebugTiles = isDebugTiles ? false : true;
    main(isDebugTiles, isDebugCollider, isDebugColliderLines);
});
document.getElementById('collider_debug').addEventListener('click', function() {
    isDebugCollider = isDebugCollider ? false : true;
    main(isDebugTiles, isDebugCollider, isDebugColliderLines);
});
document.getElementById('collider_debug_lines').addEventListener('click', function() {
    isDebugColliderLines = isDebugColliderLines ? false : true;
    main(isDebugTiles, isDebugCollider, isDebugColliderLines);
});


var tileset = new Image();
tileset.src = '20030921.jpg';
var tanksSprite    = new Image();
tanksSprite.src = 'tank.png';

var brickwall = new Image();
brickwall.src = 'brickwall.png';

function main(debugGroundBitmask, debugColliderPoints, debugColliderLines) {

    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var map = {
        types: {
            wall: 1,
            free: 0,
            brick: 2
        },
        //percents
        collides: {
            wall: 50,
            free: 0,
            brick: 100
        },
        source: [
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 2, 0, 0, 0, 2, 1],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 2, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
        ],
        size: 1,
        compiled: []
    };

    //@todo x = w, y = h
    var cell 	= {w: canvas.width / map.source[0].length, h: canvas.height / map.source.length};

    player = {
        x: cell.w * 3 + 50,
        y: cell.h * 4 + 30,
        w: cell.w,
        h: cell.h,
        rangle: 90,
        currentAngle: 0,
        dir: {x: 0, y: -1},
        currentFrame: 95,
        maxFrames: 0,
        pov_line: {
            moveTo: {x: 0, y: 0},
            lineTo: {x: 0, y: 0}
        },
        map_pov_collide_point: [],
        map_collider_point: {
            x: 0, y: 0, distance: 0
        },
        map: {i: 0, j: 0}
    };
    var cache = {
        bitmask: [],
        map_ground_colliders: []
    };
    console.log('cell');
    console.log(cell);

    function compileMap() {
        var dx = 0, dy = 0;
        for (var i in map.source) {
            for (var j in map.source[i]) {
                //4 dots
                //top line from left to right
                map.compiled.push({
                    moveTo: {x: dx, y: dy},
                    lineTo: {x: dx+cell.w, y: dy},
                    type: map.source[i][j],
                    draw_grid: true,
                    map_index: [i, j]
                });
                //from-top-right-to-bottom
                map.compiled.push({
                    moveTo: {x: dx+cell.w, y: dy},
                    lineTo: {x: dx+cell.w, y: dy + cell.h},
                    type: map.source[i][j],
                    draw_grid: false,
                    map_index: [i, j]
                });
                //from left-top-to-left-bottom
                map.compiled.push({
                    moveTo: {x: dx, y: dy},
                    lineTo: {x: dx, y: dy + cell.h},
                    type: map.source[i][j],
                    draw_grid: true,
                    map_index: [i, j]
                });
                //from left-bottom-to-right-bottom
                map.compiled.push({
                    moveTo: {x: dx, y: dy + cell.h},
                    lineTo: {x: dx+cell.w, y: dy + cell.h},
                    type: map.source[i][j],
                    draw_grid: false,
                    map_index: [i, j]
                });

                dx += cell.w;
            }

            dx = 0;
            dy += cell.h;
        }
    }

    compileMap();

    function drawMapGrid() {
        ctx.lineWidth = 1;
        ctx.strokeStyle = ctx.fillStyle = '#005214';
        ctx.beginPath();
        for (var i in map.compiled) {

            var moveTo = map.compiled[i].moveTo;
            var lineTo = map.compiled[i].lineTo;
            //console.log('moveTo: ' + moveTo.x + ', ' + moveTo.y);
            //console.log('lineTo: ' + lineTo.x + ', ' + lineTo.y);
            if(map.compiled[i].draw_grid) {
                //console.log('draw');
                ctx.moveTo(moveTo.x, moveTo.y);
                ctx.lineTo(lineTo.x, lineTo.y);
            }
            else {
                //console.log('hidden');
            }
            //console.log('----');

        }
        ctx.stroke();
    }

    /**
     * @param h
     * @param v
     * @returns {number}
     */
    function getTileBitmask(h, v, type) {
        var m = map.source;
        var w = type;
        var bitMask = 0;
        if(m[h-1] == undefined || m[h-1][v] == undefined || m[h-1][v] == w)  {
            bitMask += 2;
        }

        if(m[h-1] == undefined || m[h-1][v+1] == undefined || m[h-1][v+1] == w) {
            bitMask += 4;
        }

        if(m[h][v+1] == undefined || m[h][v+1] == w) {
            bitMask += 16;
        }
        if(m[h+1] == undefined || m[h+1][v+1] == undefined || m[h+1][v+1] == w) {
            bitMask += 128;
        }

        if(m[h+1] == undefined || m[h+1][v] == undefined || m[h+1][v] == w) {
            bitMask += 64;
        }

        if(m[h+1] == undefined || m[h+1][v-1] == undefined || m[h+1][v-1] == w) {
            bitMask += 32;
        }

        if(m[h][v-1]= undefined || m[h][v-1] == w) {
            bitMask += 8;
        }

        if(m[h-1] == undefined || m[h-1][v-1] == undefined || m[h-1][v-1] == w) {
            bitMask += 1;
        }

        return bitMask;
    }

    /**
     *
     * @param bitMask
     * @returns {{x: number, y: number}}
     */
    function getGroundTileOffsetByBitmask(bitMask) {
        var offsetX = 0;
        var offsetY = 0;
        //top corner left
        if(bitMask == 119) {
            offsetX = cell.w;
        }
        //top wall
        if(bitMask == 31 || bitMask == 63 || bitMask == 159) {
            offsetX = cell.w * 3;
        }
        //top corner right
        if(bitMask == 223) {
            offsetX = cell.w * 2;
        }
        //bottom left corner
        if(bitMask == 242) {
            offsetY = cell.h;
        }
        //bottom right corner
        if(bitMask == 254) {
            offsetY = cell.h * 2;
        }
        //bottom wall
        if(bitMask == 249 || bitMask == 248 || bitMask == 252) {
            offsetY = cell.h * 3;
        }
        //right wall
        if(bitMask == 102 || bitMask == 98 || bitMask == 226) {
            offsetX = cell.w ;
            offsetY = cell.h ;
        }
        //left wall
        if(bitMask == 215 || bitMask == 214 || bitMask == 246) {
            offsetX = cell.w * 2;
            offsetY = cell.h * 2;
        }


        return {x: offsetX, y: offsetY};
    }


    function getGroundTileColliderByBitmask(p1, p2, p3, p4, bitMask, type) {
        var chx = parseInt(cell.w);
        var chy = parseInt(cell.h);

        //GROUND COLLIDER
        if(type == map.types.wall) {
            chx = parseInt(cell.w * (map.collides.wall / 100));
            chy = parseInt(cell.h * (map.collides.wall / 100));
        }

        var colliderPoints = [];
        //top corner left
        if(bitMask == 119) {
            colliderPoints.push({
                moveTo: {x: p1.moveTo.x + chx, y: p1.lineTo.y + chy},
                lineTo: {x: p1.lineTo.x, y: p1.lineTo.y + chy}
            });
            colliderPoints.push({
                moveTo: {x: p1.moveTo.x + chx, y: p1.moveTo.y + chy},
                lineTo: {x: p1.moveTo.x + chx, y: p3.lineTo.y}
            });
        }
        //left wall
        if(bitMask == 102 || bitMask == 98 || bitMask == 226) {
            colliderPoints.push({
                moveTo: {x: p1.moveTo.x + chx, y: p1.lineTo.y},
                lineTo: {x: p1.moveTo.x  + chx, y: p3.lineTo.y}
            });
        }
        //left bottom corner
        if(bitMask == 242) {
            colliderPoints.push({
                moveTo: {x: p1.moveTo.x + chx, y: p1.moveTo.y},
                lineTo: {x: p1.moveTo.x  + chx, y: p1.moveTo.y + chy}
            });
            colliderPoints.push({
                moveTo: {x: p1.moveTo.x  + chx, y: p1.moveTo.y + chy},
                lineTo: {x: p1.lineTo.x, y: p1.moveTo.y + chy}
            });
        }
        //top wall
        if(bitMask == 63 || bitMask == 31 || bitMask == 159) {
            colliderPoints.push({
                moveTo: {x: p1.moveTo.x, y: p1.moveTo.y + chy},
                lineTo: {x: p1.lineTo.x, y: p1.moveTo.y + chy}
            });
        }
        //right top corner
        if(bitMask == 223) {
            colliderPoints.push({
                moveTo: {x: p1.moveTo.x + chx, y: p1.moveTo.y + chy},
                lineTo: {x: p1.moveTo.x, y: p1.moveTo.y + chy}
            });
            colliderPoints.push({
                moveTo: {x: p1.moveTo.x + chx, y: p1.moveTo.y + chy},
                lineTo: {x: p1.moveTo.x + chx, y: p3.lineTo.y}
            });
        }
        //right wall
        if(bitMask == 215 || bitMask == 214 || bitMask == 246 ) {
            colliderPoints.push({
                moveTo: {x: p1.moveTo.x + chx, y: p1.moveTo.y},
                lineTo: {x: p1.moveTo.x + chx, y: p3.lineTo.y}
            });
        }
        //right bottom corner
        if(bitMask == 254) {
            colliderPoints.push({
                moveTo: {x: p1.moveTo.x + chx, y: p1.moveTo.y + chy},
                lineTo: {x: p1.moveTo.x  + chx, y: p1.moveTo.y}
            });
            colliderPoints.push({
                moveTo: {x: p1.moveTo.x + chx, y: p1.moveTo.y + chy},
                lineTo: {x: p1.moveTo.x, y: p1.moveTo.y + chy}
            });
        }
        //bottom wall
        if(bitMask == 249 || bitMask == 248 || bitMask == 252) {
            colliderPoints.push({
                moveTo: {x: p1.moveTo.x, y: p1.moveTo.y + chy},
                lineTo: {x: p1.lineTo.x , y: p1.moveTo.y + chy}
            });
        }

        return colliderPoints;
    }

    function drawMap() {

        var n = 0;
        while(n < map.compiled.length) {
            //4 points produce rect
            var p1 = map.compiled[n];
            var p2 = map.compiled[n+1];
            var p3 = map.compiled[n+2];
            var p4 = map.compiled[n+3];

            var cacheKey = p1.map_index[0] + '_' + parseInt(p1.map_index[1]);
            /**
             * GROUND TERRAIN
             */
            if (p1.type == map.types.wall || p1.type == map.types.free) {
                /**
                 * NEEED CACHE BITMASK BECAUSE IF NOT CACHE
                 * GET FUCK BEHAVIOR OF CALC getTileBitmask!
                 *
                 * @type {string}
                 */

                if(cache.bitmask[cacheKey] == undefined) {
                    var bitMask 		 = getTileBitmask(
                        parseInt(p1.map_index[0]),
                        parseInt(p1.map_index[1]),
                        map.types.wall
                    );
                    cache.bitmask[cacheKey] = bitMask;
                }
                else {
                    var bitMask = cache.bitmask[cacheKey];
                }

                var groundOffset 	 = getGroundTileOffsetByBitmask(bitMask);
                var colliderPoints   = getGroundTileColliderByBitmask(p1, p2, p3, p4, bitMask, p1.type);

                cache.map_ground_colliders[cacheKey] = colliderPoints;

                ctx.drawImage(tileset, groundOffset.x, groundOffset.y, cell.w, cell.h, p1.moveTo.x, p1.moveTo.y, cell.w, cell.h);
            }
            else if(p1.type == map.types.brick) {
                if(cache.bitmask[cacheKey] == undefined) {
                    var bitMask 		 = getTileBitmask(
                        parseInt(p1.map_index[0]),
                        parseInt(p1.map_index[1]),
                        map.types.brick
                    );
                    cache.bitmask[cacheKey] = bitMask;
                }
                else {
                    var bitMask = cache.bitmask[cacheKey];
                }

                var colliderPoints = [];

                colliderPoints.push({
                    moveTo: {x: p1.moveTo.x, y: p1.moveTo.y},
                    lineTo: {x: p1.lineTo.x , y: p1.lineTo.y}
                });

                colliderPoints.push({
                    moveTo: {x: p2.moveTo.x, y: p2.moveTo.y},
                    lineTo: {x: p2.lineTo.x , y: p2.lineTo.y}
                });

                colliderPoints.push({
                    moveTo: {x: p3.moveTo.x, y: p3.moveTo.y},
                    lineTo: {x: p3.lineTo.x , y: p3.lineTo.y}
                });

                colliderPoints.push({
                    moveTo: {x: p4.moveTo.x, y: p4.moveTo.y},
                    lineTo: {x: p4.lineTo.x , y: p4.lineTo.y}
                });

                cache.map_ground_colliders[cacheKey] = colliderPoints;

                ctx.drawImage(
                    brickwall,
                    p1.moveTo.x,
                    p1.moveTo.y,
                    cell.w,
                    cell.h
                );
            }

            if(debugGroundBitmask) {
                ctx.fillStyle = 'white';
                ctx.font = '14px Arial';
                ctx.fillText(bitMask, p1.moveTo.x + 14, p1.moveTo.y + 20);
            }

            if(debugColliderPoints && colliderPoints) {
                ctx.fillStyle = 'red';
                for(var i in colliderPoints) {
                    var point = colliderPoints[i];
                    console.log(point);
                    ctx.beginPath();
                    ctx.arc(point.moveTo.x, point.moveTo.y, 5, false, Math.PI * 2);
                    ctx.arc(point.lineTo.x, point.lineTo.y, 5, false, Math.PI * 2);
                    ctx.fill();
                }
            }

            if(debugColliderLines && colliderPoints) {
                ctx.lineWidth = 5;
                ctx.strokeStyle = 'red';
                for(var i in colliderPoints) {
                    var point = colliderPoints[i];
                    ctx.beginPath();
                    ctx.moveTo(point.moveTo.x, point.moveTo.y);
                    ctx.lineTo(point.lineTo.x, point.lineTo.y);
                    ctx.stroke();
                }
            }

            n += 4;
        }
    }

    function selectPlayerFrame() {
        var r = {
            img_x: player.currentFrame,
            img_y: 0,
            sw: 65,
            sh: 80
        };

        player.currentFrame += 84;
        player.maxFrames++;
        if(player.maxFrames >= 6) {
            player.currentFrame = 95;
            player.maxFrames = 0;
        }
        return r;
    }

    function drawPlayer(disableDrawPov) {
        ctx.save();
        ctx.translate(player.x+player.w/2, player.y + player.h/2);

        ctx.rotate(deg2rad(player.currentAngle));

        var frameOffset = selectPlayerFrame();
        ctx.drawImage(
            tanksSprite,
            frameOffset.img_x,
            frameOffset.img_y,
            frameOffset.sw,
            frameOffset.sh,
            -player.w /2,
            -player.h/2,
            player.w,
            player.h
        );

        ctx.restore();

        //DRAW POV LINE
        if((disableDrawPov == undefined || !disableDrawPov) && player.map_collider_point != undefined) {
            ctx.strokeStyle = 'yellow';
            ctx.beginPath();
            ctx.moveTo(player.pov_line.moveTo.x, player.pov_line.moveTo.y);
            ctx.lineTo(player.map_collider_point.x, player.map_collider_point.y);
            ctx.stroke();
        }

    }

    function render(noDrawPlayer) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawMap();
        drawMapGrid();
        if (noDrawPlayer == undefined || !noDrawPlayer) drawPlayer();
    }

    render();

    function calcPlayerPov() {
        var rayLen = canvas.width + canvas.height;
        var pc;
        var to;
        if(player.dir.y < 0) {
            pc = {
                x: parseInt(player.x + player.w / 2),
                y: parseInt(player.y)
            };
            to = {x: pc.x, y: -rayLen}
        }
        if(player.dir.x < 0) {
            pc = {
                x: parseInt(player.x),
                y: parseInt(player.y + player.h / 2)
            };
            to = {x: -rayLen, y: pc.y};
        }
        if(player.dir.x > 0) {
            pc = {
                x: parseInt(player.x + player.w),
                y: parseInt(player.y + player.h / 2)
            };
            to = {x: rayLen, y: pc.y};
        }
        if(player.dir.y > 0) {
            pc = {
                x: parseInt(player.x + player.w / 2),
                y: parseInt(player.y + player.h)
            };
            to = {x: pc.x, y: rayLen};
        }

        player.pov_line = {
            moveTo: {x: pc.x, y: pc.y},
            lineTo: {x: to.x, y: to.y}
        };
    }

    function calcPlayerToMapCollision() {
        for(var i in cache.map_ground_colliders) {
            var colliderPoints = cache.map_ground_colliders[i];
            for(var n in colliderPoints) {
                var cp = colliderPoints[n];
                var p1 = new Point(cp.moveTo.x, cp.moveTo.y);
                var p2 = new Point(cp.lineTo.x, cp.lineTo.y);
                var p3 = new Point(player.pov_line.moveTo.x, player.pov_line.moveTo.y);
                var p4 = new Point(player.pov_line.lineTo.x, player.pov_line.lineTo.y);
                if (isCrossing(p1,p2,p3,p4)) {
                    var le = lineEquation(p3, p4);
                    var wl = lineEquation(p1, p2);
                    var cross = getCrossingPoint(
                        wl.A, wl.B, wl.C,
                        le.A, le.B, le.C
                    );
                    var distance = Math.abs(cross.X - p3.X) + Math.abs(cross.Y - p3.Y);
                    player.map_pov_collide_point.push({
                        x: cross.X,
                        y: cross.Y,
                        distance: distance
                    });
                }

            }
        }

        if(player.map_pov_collide_point) {
            player.map_pov_collide_point.sort(function(a, b) {
               return a.distance - b.distance;
            });
            console.log(player.map_pov_collide_point);
            if(player.map_pov_collide_point) {
                player.map_collider_point = player.map_pov_collide_point[0];
            }

        }

        player.map_pov_collide_point = [];
    }

    function movePlayerForward() {
        calcPlayerPov();
        console.log(player.map_pov_collide_point.distance);
        if(player.dir.y < 0){
            player.y -= 10;
            calcPlayerToMapCollision();
            if(player.map_collider_point != undefined && player.map_collider_point.distance <= 11) {
                player.y += 10;
            }
        }
        if(player.dir.x < 0){
            player.x -= 10;
            calcPlayerToMapCollision();
            if(player.map_collider_point != undefined && player.map_collider_point.distance <= 11) {
                player.x += 10;
            }
        }
        if(player.dir.y>0){
            player.y += 10;
            calcPlayerToMapCollision();
            if(player.map_collider_point != undefined &&  player.map_collider_point.distance <= 11) {
                player.y -= 10;
            }
        }
        if(player.dir.x>0){
            player.x += 10;
            calcPlayerToMapCollision();
            if(player.map_collider_point != undefined && player.map_collider_point.distance <= 11) {
                player.x -= 10;
            }
        }
        player.map = {i: Math.ceil(player.x / cell.w), j: Math.ceil(player.y / cell.h) };
        render();
    }

    function detectPlayerDir() {
        if(player.currentAngle <= -360) {
            player.currentAngle = 0;
        }

        if(player.currentAngle == 0 || player.currentAngle == -360){
            player.dir.x = 0;
            player.dir.y = -1;
        }
        if(player.currentAngle == -90){
            player.dir.x = -1;
            player.dir.y = 0;
        }
        if(player.currentAngle == -180){
            player.dir.x = 0;
            player.dir.y = 1;
        }
        if(player.currentAngle == -270){
            player.dir.x = 1;
            player.dir.y = 0;
        }
        if(player.currentAngle >= 360) {
            player.currentAngle = 0;
        }

        if(player.currentAngle == 0 || player.currentAngle == 360){
            player.dir.x = 0;
            player.dir.y = -1;
        }
        if(player.currentAngle == 90){
            player.dir.x = 1;
            player.dir.y = 0;
        }
        if(player.currentAngle == 180){
            player.dir.x = 0;
            player.dir.y = 1;
        }
        if(player.currentAngle == 270){
            player.dir.x = -1;
            player.dir.y = 0;
        }

        calcPlayerPov();

    }

    function rotatePlayerLeft() {
        render(true);
        calcPlayerPov();

        player.currentAngle -= player.rangle;
        detectPlayerDir();

        var pox = player.x;
        var poy = player.y;

        //player.x = -player.w/2;
        //player.y = -player.h/2;
        drawPlayer(true);


        player.x = pox;
        player.y = poy;
    }

    function rotatePlayerRight() {
        render(true);
        calcPlayerPov();

        player.currentAngle += player.rangle;
        detectPlayerDir();

        var pox = player.x;
        var poy = player.y;

        //player.x = -player.w/2;
        //player.y = -player.h/2;
        drawPlayer(true);


        player.x = pox;
        player.y = poy;
    }

    document.getElementById('move_forward').addEventListener('click', function() {
        movePlayerForward();
    });

    window.addEventListener('keydown', function (e) {
        if(e.keyCode == 38) {
            movePlayerForward();
        }
        if(e.keyCode == 37) {
            rotatePlayerLeft();
        }
        if(e.keyCode == 39) {
            rotatePlayerRight();
        }
        console.log(player.currentAngle);
    });

    document.getElementById('rotate_left').addEventListener('click', function() {
        rotatePlayerLeft();
    });

    document.getElementById('rotate_right').addEventListener('click', function() {
        rotatePlayerRight();
    });

    console.log(map);
    console.log(cache);
};

var countImages = 0;
var ready = false;
//RUN!
tileset.onload = function() {
    countImages++;
};

tanksSprite.onload = function() {
    countImages++;
};

brickwall.onload = function() {
    countImages++;
};

var loader = setInterval(function() {
    console.log('loading...');
    if(countImages == 3) {
        main();
        clearInterval(loader);
    }
}, 100);