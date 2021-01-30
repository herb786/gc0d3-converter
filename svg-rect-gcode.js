function findAndConvertRectTags(svgDoc) {
    var gcode = "";
    var num = svgDoc.getElementsByTagName("rect").length;
    for (i=0; i < num; i++) {
        rect = svgDoc.getElementsByTagName("rect")[i];
        console.log(rect);
        style = rect.getAttribute("style");
        stroke = obtainStrokeWidth(style);
        fill = obtainFillColor(style);
        x0 = Math.round(rect.getAttribute("x")*10)/10;
        y0 = Math.round(rect.getAttribute("y")*10)/10;
        w = Math.round(rect.getAttribute("width")*10)/10;
        h = Math.round(rect.getAttribute("height")*10)/10;
        //console.log(x0, y0, w, h);
        gcode = gcode + ";SVG rectangle\n"
        if (fill === "#000000") {
            gcode = gcodeRectFill(gcode,x0,y0,w,h);
        } else {
            gcode = gcodeRectOutline(gcode, x0, y0, w, h);
        }  
    }
    return gcode;
}
function gcodeRectOutline(gcode,x0,y0,w,h,stroke) {
    gcode = gcode + "G0 Z-" + rtct + "\n";
    gcode = gcode + "G4 P0.25" + "\n";
    gcode = gcode + "G90\n";
    newx0 = x0 - 0.5*stroke;
    newy0 = y0 - 0.5*stroke; 
    gcode = gcode + "G0 X" + newx0 + " Y" + newy0 + "\n";
    gcode = gcode + "G91\n";
    slength = 0;
    console.log(step);
    while (slength < stroke - bitd) {
        gcode = gcode + "G1 X" + slength + " Y" + slength + "\n"
        nwidth = w + 2*(stroke - slength);
        nheight = h + 2*(stroke - slength);
        slength = slength + step;
        gcode = gcode + "G1 X" + nwidth + "\n";
        gcode = gcode + "G1 Y" + nheight + "\n";
        gcode = gcode + "G1 X-" + nwidth + "\n";
        gcode = gcode + "G1 Y-" + nheight + "\n";
    }
    gcode = gcode + "G0 Z-" + rtct + "\n";
    gcode = gcode + "G4 P0.25" + "\n";
    return gcode;
}
function gcodeRectFill(gcode,x0,y0,w,h) {
    gcode = gcode + "G0 Z-" + rtct + "\n";
    gcode = gcode + "G4 P0.25" + "\n";
    gcode = gcode + "G90\n";
    gcode = gcode + "G0 X" + x0 + " Y" + y0 + "\n";
    gcode = gcode + "G91\n";
    ylength = 0;
    console.log(step);
    while (ylength < h - bitd) {
        ylength = ylength + step;
        gcode = gcode + "G1 X" + w + "\n";
        gcode = gcode + "G1 Y" + step + "\n";
        if (ylength > h - bitd) {
            break;
        }
        ylength = ylength + step;
        gcode = gcode + "G1 X-" + w + "\n";
        gcode = gcode + "G1 Y" + step + "\n";
    }
    gcode = gcode + "G0 Z-" + rtct + "\n";
    gcode = gcode + "G4 P0.25" + "\n";
    return gcode;
}