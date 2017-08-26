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
            player.pov_back_angle += player.rotate_angle_step;
            if (player.pov_angle >= 360) {
                player.pov_angle = 0;
            }

            if (player.pov_back_angle >= 360) {
                player.pov_back_angle = 0;
            }

            rotatePlayer(true);
            render();
        }
        // right
        else if (e.keyCode == 39) {
            player.pov_angle -= player.rotate_angle_step;
            player.pov_back_angle -= player.rotate_angle_step;
            if (player.pov_angle <= -360) {
                player.pov_angle = 0;
            }
            if (player.pov_back_angle <= -360) {
                player.pov_back_angle = 0;
            }
            rotatePlayer(true);
            render();
        }
        // up-forward
        else if (e.keyCode == 38) {
            movePlayerForward();
            render();
        }
        else if (e.keyCode == 40) {
            movePlayerBackward();
            render();
        }
        //console.log(e.keyCode);
    });

}