function findAndConvertCircleTags(svgDoc) {
    var gcode = "";
    var num = svgDoc.getElementsByTagName("circle").length;
    for (i=0; i < num; i++) {
        elem = svgDoc.getElementsByTagName("circle")[i];
        console.log(elem);
        style = elem.getAttribute("style");
        stroke = obtainStrokeWidth(style);
        fill = obtainFillColor(style);
        cy = Math.round(elem.getAttribute("cx")*10)/10;
        cx = Math.round(elem.getAttribute("cy")*10)/10;
        r = Math.round(elem.getAttribute("r")*10)/10;
        console.log(cx, cy, r);
        gcode = gcode + ";SVG circle\n";
        if (ignoreStyle) {
            gcode = simpleCircle(gcode,cx,cy,r);
        } else if (fill === "#000000") {
            gcode = gcodeCircleFill(gcode,cx,cy,r);
        } else {
            gcode = gcodeCircleOutline(gcode,cx,cy,r,stroke);
        }
    }
    return gcode;
}
function simpleCircle(gcode,cx,cy,r){
    gcode = retractSpindle(gcode);
    gcode = gcode + "G4 P0.25" + "\n";
    gcode = gcode + "G90\n";
    gcode = gcode + "G0 X" + parseFloat(cx-r).toFixed(2) + " Y" + parseFloat(cy).toFixed(2) + "\n";
    gcode = gcode + "G2 X" + parseFloat(cx-r).toFixed(2) + " Y" + parseFloat(cy).toFixed(2) + " I" + parseFloat(r).toFixed(2) + "\n";
    gcode = retractSpindle(gcode);
    return gcode;
}
function gcodeCircleOutline(gcode,cx,cy,r,stroke){
    gcode = retractSpindle(gcode);
    newx0 = cx - r - 0.5*stroke;
    newy0 = cy;
    gcode = gcode + "G0 X" + parseFloat(newx0).toFixed(2) + " Y" + parseFloat(newy0).toFixed(2) + "\n";
    slength = 0.0;
    while (slength < stroke - bitd) {
        newR = r + 0.5*stroke - slength;
        gcode = gcode + "G2 X" + parseFloat(newx0).toFixed(2) + " Y" + parseFloat(newy0).toFixed(2) + " I" + parseFloat(newR).toFixed(2) + "\n";
        slength = slength + step;
        newx0 = cx - r - 0.5*stroke + slength;
        gcode = gcode + "G91\n";
        gcode = gcode + "G1 X" + step +"\n";
        gcode = gcode + "G90\n";
    }
    gcode = retractSpindle(gcode);;
    return gcode;
}
function gcodeCircleFill(gcode,cx,cy,r,){
    gcode = retractSpindle(gcode);
    newx0 = cx - r - 0.5*stroke;
    newy0 = cy;
    gcode = gcode + "G0 X" + parseFloat(newx0).toFixed(2) + " Y" + parseFloat(newy0).toFixed(2) + "\n";
    slength = 0.0;
    while (slength < r - 0.5*bitd + 0.5*stroke) {
        newR = r + 0.5*stroke - slength;
        gcode = gcode + "G2 X" + parseFloat(newx0).toFixed(2) + " Y" + parseFloat(newy0).toFixed(2) + " I" + parseFloat(newR).toFixed(2) + "\n";
        slength = slength + step;
        newx0 = cx - r - 0.5*stroke + slength;
        gcode = gcode + "G91\n";
        gcode = gcode + "G1 X" + step +"\n";
        gcode = gcode + "G90\n";
    }
    gcode = retractSpindle(gcode);
    return gcode;
}