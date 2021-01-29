//var gcode;
var parser, zStep, speed, rtct, step, bitd;
parser = new DOMParser();
var task = document.getElementById("task");
var result = document.getElementById("result");
var loadsvg = document.getElementById("loadsvg");
var copycode = document.getElementById("copycode");
//var savecode = document.getElementById("savecode");
var disk = document.getElementById("disk");
var clear = document.getElementById("clear");
clear.addEventListener('click', event => {
    task.value = "";
    result.value = "";
});
//savecode.addEventListener('click', event => {});
loadsvg.addEventListener('click', event => {
    var svgcode = task.value;
    // parameters
    zStep = parseFloat(document.getElementById("zramp").value);
    speed = parseFloat(document.getElementById("speed").value);
    rtct = parseFloat(document.getElementById("retraction").value);
    step = parseFloat(document.getElementById("step").value);
    bitd = parseFloat(document.getElementById("bitd").value);
    console.log("Loaded!");
    // process svg
    svgDoc = parser.parseFromString(svgcode,"text/xml");
    result.value = analizeSVG(svgDoc);
    // save file locally
    localStorage.setItem('samplenc', result.value);
    var file = new Blob([result.value], {type: 'text/plain'});
    disk.href = URL.createObjectURL(file);
    disk.download = 'sample.nc';
});
copycode.addEventListener('click', event => {
    result.select(); 
    document.execCommand("copy");
    console.log("Copied!");
});
function analizeSVG(svgDoc) {
    var newGcode = "G90 (use absolute coordinates)\n";
    newGcode = newGcode + "G0 X0 Y0 Z0 F3000\n";
    newGcode = newGcode + "G0 Z-5\n";
    //newGcode = newGcode + "M3 S500\n";
    sinkAction = false;
    newGcode = newGcode + findAndConvertRectTags(svgDoc);
    newGcode = newGcode + findAndConvertCircleTags(svgDoc);
    newGcode = newGcode + "M5\n";
    newGcode = newGcode + "G0 X0 Y0 Z-5 (move back to origin)\n";
    return newGcode;
}
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
        gcode = gcode + ";SVG circle\n"
        if (fill === "#000000") {
            gcode = gcodeCircleFill(gcode,cx,cy,r);
        } else {
            gcode = gcodeCircleOutline(gcode,cx,cy,r,stroke);
        }
    }
    return gcode;
}
function gcodeCircleOutline(gcode,cx,cy,r,stroke){
    gcode = gcode + "G0 Z-" + rtct + "\n";
    gcode = gcode + "G4 P0.25" + "\n";
    gcode = gcode + "G90\n";
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
    gcode = gcode + "G0 Z-" + rtct + "\n";
    gcode = gcode + "G4 P0.25" + "\n";
    return gcode;
}
function gcodeCircleFill(gcode,cx,cy,r,){
    gcode = gcode + "G0 Z-" + rtct + "\n";
    gcode = gcode + "G4 P0.25" + "\n";
    gcode = gcode + "G90\n";
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
    gcode = gcode + "G0 Z-" + rtct + "\n";
    gcode = gcode + "G4 P0.25" + "\n";
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
function obtainFillColor(style) {
    var out = style.match(/fill:(.*?);/);
    var fill = out[1];
    return fill;
}
function obtainStrokeWidth(style) {
    var out = style.match(/stroke-width:(\d+\.?\d*)/);
    var stroke = Math.round(parseFloat(out[1])*10)/10;
    console.log(stroke);
    return stroke;
}
function createGroovePasses(firstPass) {
    
}