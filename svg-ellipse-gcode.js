function findAndConvertEllipseTags(svgDoc) {
    var gcode = "";
    var num = svgDoc.getElementsByTagName("ellipse").length;
    for (i=0; i < num; i++) {
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
        if (ignoreStyle) {
            gcode = simpleEllipse(gcode,cx,cy,rx,ry);
        } else if (fill === "#000000") {
            gcode = gcodeEllipseFill(gcode,cx,cy,rx,ry);
        } else {
            gcode = gcodeEllipseOutline(gcode,cx,cy,rx,ry,stroke);
        }
    }
    return gcode;
}
function simpleEllipse(gcode,cx,cy,rx,ry){
    gcode = retractSpindle(gcode);
    gcode = gcode + "G0 X" + parseFloat(cx-rx).toFixed(2) + " Y" + parseFloat(cy).toFixed(2) + "\n";
    gcode = gcode + "G91\n";
    epoints = nextPoints(cx,cy,rx, ry);
    for (i=0;i<epoints["x"].length;i++) {
        xp = epoints["x"][i];
        yp = epoints["y"][i];
        gcode = gcode + "G1 X" + parseFloat(xp).toFixed(2) + " Y" + parseFloat(yp).toFixed(2) + "\n";
    }
    gcode = retractSpindle(gcode);
    return gcode;
} 
function gcodeEllipseOutline(gcode,cx,cy,rx,ry,stroke){
    gcode = retractSpindle(gcode);
    newx0 = cx - rx - 0.5*stroke;
    newy0 = cy;
    gcode = gcode + "G0 X" + parseFloat(newx0).toFixed(2) + " Y" + parseFloat(newy0).toFixed(2) + "\n";
    slength = 0.0;
    gcode = gcode + "G91\n";
    while (slength < stroke - bitd) {
        gcode = gcode + ";draw ellipse path\n"
        newRx = rx + 0.5*stroke - slength;
        newRy = ry*newRx/rx;
        epoints = nextPoints(cx,cy,newRx, newRy);
        gcode = gcode + "G1 X" + parseFloat(step).toFixed(2) + "\n";
        for (i=0;i<epoints["x"].length;i++) {
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
    newx0 = cx - r - 0.5*stroke;
    newy0 = cy;
    gcode = gcode + "G0 X" + parseFloat(newx0).toFixed(2) + " Y" + parseFloat(newy0).toFixed(2) + "\n";
    slength = 0.0;
    gcode = gcode + "G91\n";
    while (slength < r - 0.5*bitd + 0.5*stroke) {
        newRx = rx + 0.5*stroke - slength;
        newRy = ry*newRx/rx;
        epoints = nextPoints(cx,cy,newRx, newRy);
        gcode = gcode + "G1 X" + parseFloat(step).toFixed(2) + "\n";
        for (i=0;i<epoints["x"].length;i++) {
            xp = epoints["x"][i];
            yp = epoints["y"][i];
            gcode = gcode + "G1 X" + parseFloat(xp).toFixed(2) + " Y" + parseFloat(yp).toFixed(2) + "\n";
        } 
        slength = slength + step; 
    }
    gcode = retractSpindle(gcode);
    return gcode;
}
function nextPoints(cx,cy,a,b) {
    var basex = [];
    var basey = [];
    x0 = cx - a;
    y0 = cy;
    y1 = 0;
    x1 = 0;
    while (x0 + step < cx) {
        x1 = x0 + step;
        dd = Math.abs(a*a*b*b - b*b*(x0-cx)*(x0-cx));     
        y1 = cy + Math.sqrt(dd)/a;
        basex.push(x1-x0);
        basey.push(y1-y0);
        y0 = y1;
        x0 = x1;
    }
    basex.push(cx - x1);
    basey.push(cy + b - y1);
    var pointx = []; 
    var pointy = []; 
    let pts = basex.length;
    console.log(pts);
    for (i=0; i<pts; i++){
        pointx.push(basex[i]);
        pointy.push(basey[i]);
    };
    for (i=0; i<pts; i++){
        pointx.push(basex[pts-i-1]);
        pointy.push(-basey[pts-i-1]);
    };
    for (i=0; i<pts; i++){
        pointx.push(-basex[i]);
        pointy.push(-basey[i]);
    };
    for (i=0; i<pts; i++){
        pointx.push(-basex[pts-i-1]);
        pointy.push(basey[pts-i-1]);
    };
    points = {"x":pointx,"y":pointy};
    return points; 
}