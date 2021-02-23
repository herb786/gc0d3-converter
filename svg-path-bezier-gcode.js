// https://www.w3.org/TR/SVG/paths.html#PathDataCubicBezierCommands
// https://en.wikipedia.org/wiki/B%C3%A9zier_curve
function computeXYInParametricLine(tt,xi, yi, xf, yf){
    var dx = xf - xi;
    var dy = yf - yi;
    //var normXY = Math.sqrt(dx*dx + dy*dy);
    var xt = xi + dx*tt;
    var yt = yi + dy*tt;
    var res = {"xt":xt,"yt":yt};
    //console.log(res);
    return res;
};
function computeCubicBezierDrawingParameter(xglobal,yglobal,xcp1,ycp1,xcp2,ycp2,xend,yend) {
    var points = [];
    var step = 0.05;
    //console.log(step);
    for (var i=0; i<20; i++){
        var t  = i*step;
        var q0 = computeXYInParametricLine(t, xglobal, yglobal, xcp1, ycp1);
        var q1 = computeXYInParametricLine(t, xcp1, ycp1, xcp2, ycp2);
        var r0 = computeXYInParametricLine(t, q0.xt, q0.yt, q1.xt, q1.yt);
        var q2 = computeXYInParametricLine(t, xcp2, ycp2, xend, yend);
        var r1 = computeXYInParametricLine(t, q1.xt, q1.yt, q2.xt, q2.yt);
        var bb = computeXYInParametricLine(t, r0.xt, r0.yt, r1.xt, r1.yt);
        points.push({"x":bb.xt,"y":bb.yt});
    }
    //console.log(points);
    return points;
}
function computeQuadraticBezierDrawingParameter(xglobal,yglobal,xcp1,ycp1,xend,yend) {
    var points = [];
    var step = 0.05;
    //console.log(step);
    for (var i=0; i<20; i++){
        var t  = i*step;
        var q0 = computeXYInParametricLine(t, xglobal, yglobal, xcp1, ycp1);
        var q1 = computeXYInParametricLine(t, xcp1, ycp1, xend, yend);
        var bb = computeXYInParametricLine(t, q0.xt, q0.yt, q1.xt, q1.yt);
        points.push({"x":bb.xt,"y":bb.yt});
    }
    //console.log(points);
    return points;
}