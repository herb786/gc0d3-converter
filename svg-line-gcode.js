function findAndConvertLineTags(svgDoc) {
    var gcode = "";
    var num = svgDoc.getElementsByTagName("line").length;
    for (i=0; i < num; i++) {
        rect = svgDoc.getElementsByTagName("line")[i];
        console.log(rect);
        style = rect.getAttribute("style");
        stroke = obtainStrokeWidth(style);
        color = obtainStrokeColor(style);
        console.log(stroke);
        //stroke = Math.round(rect.getAttribute("stroke-width")*10)/10;
        x1 = Math.round(rect.getAttribute("x1")*10)/10;
        y1 = Math.round(rect.getAttribute("y1")*10)/10;
        x2 = Math.round(rect.getAttribute("x2")*10)/10;
        y2 = Math.round(rect.getAttribute("y2")*10)/10;
        gcode = gcode + ";SVG line\n";
        groovePasses = getGrooveStepsGrayscale(color);
        for (var k=0;k<groovePasses;k++) {
            setGlobalGrooveHeight(k);
            if (ignoreStyle || bitd > stroke-0.5) {
                gcode = simpleLine(gcode,x1,y1,x2,y2);
            } else {
                gcode = gcodeLineOutline(gcode,x1,y1,x2,y2,stroke);
            }  
        }
    }
    return gcode;
}
function simpleLine(gcode,x1,y1,x2,y2) {
    gcode = retractSpindle(gcode);
    gcode = gcode + "G0 X" + x1 + " Y" + y1 + "\n";
    gcode = plungeSpindle(gcode,"relative");
    dx = x2 - x1;
    dy = y2 - y1;
    gcode = retractSpindle(gcode);
    gcode = gcode + "G1 X" + parseFloat(dx).toFixed(2) + " Y" + parseFloat(dy).toFixed(2) + "\n";
    gcode = retractSpindle(gcode);
    return gcode;
}
function gcodeLineOutline(gcode,x1,y1,x2,y2,stroke) {
    gcode = retractSpindle(gcode);
    newx0 = x1 - 0.5*stroke;
    slope = (y1-y2)/(x2-x1);
    stepy = step*slope;
    newy0 = y1 - 0.5*stroke*slope; 
    gcode = gcode + "G0 X" + parseFloat(newx0).toFixed(2) + " Y" + parseFloat(newy0).toFixed(2) + "\n";
    gcode = plungeSpindle(gcode,"relative");
    dx = x2 - x1;
    dy = y2 - y1;
    slength = 0;
    sign = 1;
    do {
        if (slength > 0) {
            gcode = gcode + "G1 X" + parseFloat(step).toFixed(2) + " Y" + parseFloat(stepy).toFixed(2) + "\n";
        }
        gcode = gcode + "G1 X" + sign*parseFloat(dx).toFixed(2) + " Y" + sign*parseFloat(dy).toFixed(2) + "\n";
        slength = slength + step;
        sign = -1*sign;
    } while (slength < stroke - bitd);
    gcode = retractSpindle(gcode);
    return gcode;
}