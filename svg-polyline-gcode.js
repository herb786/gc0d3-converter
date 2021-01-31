function findAndConvertPolylineTags(svgDoc) {
    var gcode = "";
    var num = svgDoc.getElementsByTagName("polyline").length;
    for (i=0; i < num; i++) {
        rect = svgDoc.getElementsByTagName("polyline")[i];
        console.log(rect);
        points = rect.getAttribute("points");
        style = rect.getAttribute("style");
        stroke = obtainStrokeWidth(style);
        //stroke = Math.round(rect.getAttribute("stroke-width")*10)/10;
        console.log(stroke);
        var mypairs = processPolylinePoints(points);
        gcode = gcode + ";SVG polyline\n"
        if (ignoreStyle) {
            gcode = simplePolyline(gcode,mypairs);
        } else {
            gcode = gcodePolylineOutline(gcode,mypairs,stroke);
        }  
    }
    return gcode;
}
function simplePolyline(gcode,mypairs) {
    gcode = retractSpindle(gcode);
    x0 = mypairs.x[0];
    y0 = mypairs.y[0];
    gcode = gcode + "G0 X" + x0 + " Y" + y0 + "\n";
    gcode = gcode + "G91\n";
    for (i=0; i<mypairs.x.length-1; i++) {
        x1 = mypairs.x[i];
        y1 = mypairs.y[i];
        x2 = mypairs.x[i+1];
        y2 = mypairs.y[i+1];
        dx = x2 - x1;
        dy = y2 - y1;
        line = "G1 X" + parseFloat(dx).toFixed(2) + " Y" + parseFloat(dy).toFixed(2) + "\n";
        //console.log(line);
        gcode = gcode + line;
    }
    gcode = retractSpindle(gcode);
    return gcode;
}
function gcodePolylineOutline(gcode,mypairs,stroke) {
    gcode = gcodePolylineXYOutline(gcode,mypairs,stroke,false);
    gcode = gcodePolylineXYOutline(gcode,mypairs,stroke,true);
    gcode = retractSpindle(gcode);
    return gcode;
}
function gcodePolylineXYOutline(gcode,mypairs,stroke,isY) {
    gcode = retractSpindle(gcode);
    x1 = mypairs.x[0];
    y1 = mypairs.y[0];
    newx0 = x1 - 0.5*stroke;
    newy0 = y1 ;
    axis = "X";
    if (isY) {
        newx0 = x1;
        newy0 = y1 - 0.5*stroke;
        axis = "Y";
    }
    slength = 0;
    gcode = gcode + "G0 X" + parseFloat(newx0).toFixed(2) + " Y" + parseFloat(newy0).toFixed(2) + "\n";
    gcode = gcode + "G91\n";
    do {
        if (slength > 0) {
            gcode = gcode + "G1 " + axis + parseFloat(slength).toFixed(2) + "\n";
        }
        for (i=0; i<mypairs.x.length-1; i++) {
            x1 = mypairs.x[i];
            y1 = mypairs.y[i];
            x2 = mypairs.x[i+1];
            y2 = mypairs.y[i+1];
            dx = x2 - x1;
            dy = y2 - y1;
            gcode = gcode + "G1 X" + parseFloat(dx).toFixed(2) + " Y" + parseFloat(dy).toFixed(2) + "\n";
        }
        slength = slength + step;
        gcode = retractSpindle(gcode);
        gcode = gcode + "G0 X" + parseFloat(newx0).toFixed(2) + " Y" + parseFloat(newy0).toFixed(2) + "\n";
        gcode = gcode + "G91\n";
    } while (slength < stroke - bitd);
    return gcode;
}
function processPolylinePoints(points) {
    points = points.trim();
    //console.log(points);
    pairs = points.split(" ");
    //console.log(pairs);
    var basex = [];
    var basey = [];
    for (i=0; i<pairs.length; i++) {
        coord = pairs[i].split(",");
        basex.push(Math.round(parseFloat(coord[0])*10)/10);
        basey.push(Math.round(parseFloat(coord[1])*10)/10);
    }
    var epoints = {x:basex,y:basey};
    //console.log(epoints);
    return epoints; 
}
  