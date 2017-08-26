var vectorMulti = function(ax, ay, bx, by) {
    return ax*by-bx*ay;
};

var isCrossing = function(p1, p2, p3, p4) {
    var v1 = vectorMulti(p4.X - p3.X, p4.Y - p3.Y, p1.X - p3.X, p1.Y - p3.Y);
    var v2 = vectorMulti(p4.X - p3.X, p4.Y - p3.Y, p2.X - p3.X, p2.Y - p3.Y);
    var v3 = vectorMulti(p2.X - p1.X, p2.Y - p1.Y, p3.X - p1.X, p3.Y - p1.Y);
    var v4 = vectorMulti(p2.X - p1.X, p2.Y - p1.Y, p4.X - p1.X, p4.Y - p1.Y);

    return !!((v1*v2)<0 && (v3*v4)<0);
};

/**
 * Объект точки
 * Взято отсюда @link http://grafika.me/node/362
 *
 * @param x
 * @param y
 */
var Point = function(x, y) {
    this.X = x;
    this.Y = y;
};

/**
 * Построение уравнения прямой
 * вида: Ax+By+C=0
 * Взято отсюда @link http://grafika.me/node/362
 *
 * @param p1
 * @param p2
 * @returns {{A: number, B: number, C: number}}
 */
var lineEquation = function(p1, p2)
{
    var A =p2.Y-p1.Y;
    var B =p1.X-p2.X;
    var C =-p1.X*(p2.Y-p1.Y)+p1.Y*(p2.X-p1.X);

    return {A: A, B: B, C: C};
};

/**
 * Получить Point точку пересечения по коэфицентам уравнения прямой
 * Взято отсюда @link http://grafika.me/node/362
 */
var getCrossingPoint = function(a1,b1,c1,a2,b2,c2) {

    var d = parseInt(a1*b2-b1*a2);
    var dx = parseInt(-c1*b2+b1*c2);
    var dy =parseInt(-a1*c2+c1*a2);
    var X = parseInt(dx/d);
    var Y = parseInt(dy/d);

    return new Point(X, Y);
};

var rotatePoint = function(x, y, ox, oy, angle) {
    var s = Math.sin(deg2rad(angle));
    var c = Math.cos(deg2rad(angle));

    return {
        x: Math.floor(ox + x * c),
        y: Math.floor(oy - y * s)
    };
}

var deg2rad = function (deg) {
    return (Math.PI / 180) * deg;
}

var getRandomArbitrary = function(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}