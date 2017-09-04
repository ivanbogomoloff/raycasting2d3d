var isR3inited = false;
var ctx2, canvas2;
function initRender3d() {
    if(!isR3inited) {
        isR3inited = true;
        canvas2 = document.getElementById('canvas2');
        ctx2 = canvas2.getContext('2d');
    }
}

function render3d() {
    ctx2.clearRect(0,0,canvas2.width, canvas2.height);
}