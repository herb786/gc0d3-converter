function findAndConvertEllipseTags(svgDoc) {
    var gcode = "";
    var num = svgDoc.getElementsByTagName("ellipse").length;
    for (var i=0; i < num; i++) {
        elem = svgDoc.getElementsByTagName("ellipse")[i];
        console.log(elem);
        style = elem.getAttribute("style");
        stroke = obtainStrokeWidth(style);
        fill = obtainFillColor(style);
        cy = Math.round(elem.getAttribute("cy")*10)/10;
        cx = Math.round(elem.getAttribute("cx")*10)/10;
        rx = Math.round(elem.getAttribute("rx")*10)/10;
        ry = Math.round(elem.getAttribute("ry")*10)/10;
        console.log(cx, cy, rx, ry);
        gcode = gcode + ";SVG ellipse\n";
        if (fill === "none") {
            groovePasses = getGrooveStepsGrayscale(color);
        } else {
            groovePasses = getGrooveStepsGrayscale(fill);
        }
        for (var k=0;k<groovePasses;k++) {
            setGlobalGrooveHeight(k);
            if (ignoreStyle) {
                gcode = simpleEllipse(gcode,cx,cy,rx,ry);
            } else if (fill != "none") {
                gcode = gcodeEllipseFill(gcode,cx,cy,rx,ry);
            } else if (bitd > stroke-0.5){
                gcode = simpleEllipse(gcode,cx,cy,rx,ry);
            } else {
                gcode = gcodeEllipseOutline(gcode,cx,cy,rx,ry,stroke);
            }
        }
    }
    return gcode;
}
function simpleEllipse(gcode,cx,cy,rx,ry){
    gcode = retractSpindle(gcode);
    gcode = gcode + "G0 X" + parseFloat(cx-rx).toFixed(2) + " Y" + parseFloat(cy).toFixed(2) + "\n";
    gcode = plungeSpindle(gcode,"relative");
    epoints = nextPoints(cx,cy,rx, ry);
    for (var i=0;i<epoints["x"].length;i++) {
        xp = epoints["x"][i];
        yp = epoints["y"][i];
        gcode = gcode + "G1 X" + parseFloat(xp).toFixed(2) + " Y" + parseFloat(yp).toFixed(2) + "\n";
    }
    gcode = retractSpindle(gcode);
    return gcode;
} 
function gcodeEllipseOutline(gcode,cx,cy,rx,ry,stroke){
    gcode = retractSpindle(gcode);
    newx0 = cx - rx - 0.5*stroke + 0.5*bitd;
    newy0 = cy;
    console.log(newx0,newy0);
    gcode = gcode + "G0 X" + parseFloat(newx0).toFixed(2) + " Y" + parseFloat(newy0).toFixed(2) + "\n";
    gcode = plungeSpindle(gcode,"relative");
    slength = 0.0;
    while (slength < stroke - bitd) {
        gcode = gcode + ";draw ellipse path\n"
        newRx = rx + 0.5*stroke - slength - 0.5*bitd;
        newRy = ry*newRx/rx;
        epoints = nextPoints(cx,cy,newRx, newRy);
        if (slength > 0) {
            gcode = gcode + "G1 X" + parseFloat(0.5*step).toFixed(2) + "\n";
        }
        for (var i=0;i<epoints["x"].length;i++) {
            xp = epoints["x"][i];
            yp = epoints["y"][i];
            gcode = gcode + "G1 X" + parseFloat(xp).toFixed(2) + " Y" + parseFloat(yp).toFixed(2) + "\n";
        } 
        slength = slength + step;     
    }
    gcode = retractSpindle(gcode);
    return gcode;
}
function gcodeEllipseFill(gcode,cx,cy,rx,ry){
    gcode = retractSpindle(gcode);
    newx0 = cx - rx - 0.5*stroke + 0.5*bitd;
    newy0 = cy;
    console.log(newx0,newy0);
    gcode = gcode + "G0 X" + parseFloat(newx0).toFixed(2) + " Y" + parseFloat(newy0).toFixed(2) + "\n";
    gcode = plungeSpindle(gcode,"relative");
    slength = 0.0;
    while (slength < rx - 0.5*bitd + 0.5*stroke) {
        newRx = rx + 0.5*stroke - slength - 0.5*bitd;
        newRy = ry*newRx/rx;
        epoints = nextPoints(cx,cy,newRx, newRy);
        if (slength > 0) {
            gcode = gcode + "G1 X" + parseFloat(0.5*step).toFixed(2) + "\n";
        }
        for (var i=0;i<epoints["x"].length;i++) {
            xp = epoints["x"][i];
            yp = epoints["y"][i];
            gcode = gcode + "G1 X" + parseFloat(xp).toFixed(2) + " Y" + parseFloat(yp).toFixed(2) + "\n";
        } 
        slength = slength + 0.5*step; 
    }
    gcode = retractSpindle(gcode);
    return gcode;
}
function nextPoints(cx,cy,a,b) {
    var basex = [];
    var basey = [];
    var x0 = cx - a;
    var y0 = cy;
    var theta = 190;
    while(theta < 360 + 181) {
        x1 = parseFloat(cx) + parseFloat(a)*Math.cos(theta*Math.PI/180)
        y1 = parseFloat(cy) + parseFloat(b)*Math.sin(theta*Math.PI/180)
        basex.push(x1-x0);
        basey.push(y1-y0);
        theta = theta + 5;
        y0 = y1;
        x0 = x1;
    }
    var points = {"x":basex,"y":basey};
    //console.log(points);
    return points; 

}