// https://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
function computeRotatedXYStart(phi,x1,x2,y1,y2){
    console.log("computeRotatedXYStart");
    console.log(phi,x1,x2,y1,y2);
    var m11 = Math.cos(phi*Math.PI/180);
    var m12 = Math.sin(phi*Math.PI/180);
    var m21 = -m12;
    var m22 = m11;
    var x1p = 0.5*m11*(x1-x2) + 0.5*m12*(y1-y2);
    var y1p = 0.5*m21*(x1-x2) + 0.5*m22*(y1-y2);
    return {"x":x1p,"y": y1p};
};
function computeRotatedCenter(x1p,y1p,x1,x2,y1,y2,rx,ry,fa,fs){
    console.log("computeRotatedCenter");
    console.log(x1p,y1p,x1,x2,y1,y2,rx,ry,fa,fs);
    var sgn = -1;
    if (fa != fs) {
        sgn = 1;
    }
    var numerator =(rx**2)*(ry**2)-(rx**2)*(y1p**2)-(ry**2)*(x1p**2);
    var denominator = (rx**2)*(y1p**2)+(ry**2)*(x1p**2);
    var cxp = sgn*rx*y1p*Math.sqrt(numerator/denominator)/ry;
    var cyp = -1*sgn*ry*x1p*Math.sqrt(numerator/denominator)/rx;
    var res = {"cx":cxp, "cy":cyp};
    console.log(res);
    return res;
};
function computeCenter(cxp, cyp, x1, y1, x2, y2, phi) {
    console.log("computeCenter");
    console.log(cxp, cyp, x1, y1, x2, y2, phi);
    var m11 = Math.cos(phi*Math.PI/180);
    var m12 = -Math.sin(phi*Math.PI/180);
    var m21 = -m12;
    var m22 = m11;
    var cx = m11*cxp + m12*cyp + 0.5*(x1+x2);
    console.log(0.5*x1+x2);
    var cy = m21*cxp + m22*cyp + 0.5*(y1+y2);
    var res = {"cx":cx, "cy":cy};
    console.log(res);
    return res;
};
function computeAngleBetweenVectors(x1, y1, x2, y2) {
    console.log("computeAngleBetweenVectors");
    console.log(x1, y1, x2, y2);
    var dotProduct = x1*x2 + y1*y2;
    var normXY1 = Math.sqrt(x1*x1 + y1*y1);
    var normXY2 = Math.sqrt(x2*x2 + y2*y2);
    var sgn = Math.sign(x1*y2 - y1*x2);
    var theta = sgn*Math.acos(dotProduct/(normXY1*normXY2));
    return theta;
};
function computeThetaAndDelta(x1p,y1p,cxp,cyp,rx,ry,fs) {
    console.log("computeThetaAndDelta");
    console.log(x1p,y1p,cxp,cyp,rx,ry,fs);
    var v1x = 1;
    var v1y = 0;
    var v2x = (x1p-cxp)/rx;
    var v2y = (y1p-cyp)/ry;
    var theta1 = computeAngleBetweenVectors(v1x, v1y, v2x, v2y);
    var v3x = (-x1p-cxp)/rx;
    var v3y = (-y1p-cyp)/ry;
    var delta = (180*computeAngleBetweenVectors(v2x, v2y, v3x, v3y)/Math.PI) % 360;
    var delta = Math.PI*delta/180;
    if (fs == 0 && delta > 0) {
        delta = delta - 2*Math.PI;
    }
    if (fs == 1 && delta < 0) {
        delta = delta + 2*Math.PI;
    }
    return {"theta":theta1, "delta":delta}
};
function computeDrawingParameter(x1,y1,x2,y2,rx,ry,phi,fa,fs) {
    var zp = computeRotatedXYStart(phi,x1,x2,y1,y2);
    var cp = computeRotatedCenter(zp.x,zp.y,x1,x2,y1,y2,rx,ry,fa,fs);
    var cc = computeCenter(cp.cx, cp.cy, x1, y1, x2, y2, phi);
    var angles = computeThetaAndDelta(zp.x,zp.y,cp.cx,cp.cy,rx,ry,fs);
    var delta = parseFloat(angles.delta).toFixed(3);
    var theta1 = parseFloat(angles.theta).toFixed(3);
    var cx = parseFloat(cc.cx).toFixed(3);
    var cy = parseFloat(cc.cy).toFixed(3);
    console.log(zp,cp,cx,cy,theta1,delta);
    points = [];
    var step = delta/100;
    //console.log(step);
    for (var i=0; i<100; i++){
        var ag = parseFloat(theta1)+i*step;
        var x = parseFloat(cx) + parseFloat(rx)*Math.cos(ag);
        var y = parseFloat(cy) + parseFloat(ry)*Math.sin(ag);
        var x1 = parseFloat(x).toFixed(3);
        var y1 = parseFloat(y).toFixed(3);
        points.push({"x":x1,"y":y1});
    }
    console.log(points);
    return points;
}