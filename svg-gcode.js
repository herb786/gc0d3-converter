//var gcode;
// https://developer.mozilla.org/en-US/docs/Web/SVG/Element
// http://linuxcnc.org/docs/html/
var parser, zStep, speed, rtct, step, bitd, ignoreStyle, grooveHeight;
var xglobal = 0.0;
var yglobal = 0.0;
var xpathStart = 0.0;
var ypathStart = 0.0;
var xpathMode = "open";
var ypathMode = "open";
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
    result.value = "";
    //setTimeout(2000);
    restartGlobalParameters();
    zDepth = parseFloat(document.getElementById("depth").value);
    zStep = parseFloat(document.getElementById("zramp").value);
    speed = parseFloat(document.getElementById("speed").value);
    rtct = parseFloat(document.getElementById("retraction").value);
    //step = parseFloat(document.getElementById("step").value);
    bitd = parseFloat(document.getElementById("bitd").value);
    step = 0.5*bitd;
    ignoreStyle = document.getElementById("ignore").checked;
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
    console.log("Analize SVG!");
    var newGcode = "G90 (use absolute coordinates)\n";
    newGcode = newGcode + "G0 X0 Y0 Z0 F3000\n";
    newGcode = newGcode + "G0 Z-5\n";
    newGcode = newGcode + "M3 S500\n";
    sinkAction = false;
    newGcode = newGcode + findAndConvertRectTags(svgDoc);
    newGcode = newGcode + findAndConvertCircleTags(svgDoc);
    newGcode = newGcode + findAndConvertEllipseTags(svgDoc);
    newGcode = newGcode + findAndConvertLineTags(svgDoc);
    newGcode = newGcode + findAndConvertPolylineTags(svgDoc);
    newGcode = newGcode + findAndConvertPolygonTags(svgDoc);
    console.log("SVG Path!");
    newGcode = newGcode + findAndConvertPathTags(svgDoc);
    newGcode = newGcode + "M5\n";
    newGcode = newGcode + "G0 X0 Y0 Z-5 (move back to origin)\n";
    return newGcode;
};
function getGrooveStepsGrayscale(color) {
    if (color=== "#000000") {
        return parseInt(zDepth/zStep);
    }
    if (color=== "#1a1a1a") {
        return parseInt(0.9*zDepth/zStep);
    }
    if (color=== "#333333") {
        return parseInt(0.8*zDepth/zStep);
    }
    if (color=== "#4d4d4d") {
        return parseInt(0.7*zDepth/zStep);
    }
    if (color=== "#666666") {
        return parseInt(0.6*zDepth/zStep);
    }
    if (color=== "#808080") {
        return parseInt(0.5*zDepth/zStep);
    }
    if (color=== "#999999") {
        return parseInt(0.4*zDepth/zStep);
    }
    if (color=== "#b3b3b3") {
        return parseInt(0.3*zDepth/zStep);
    }
    if (color=== "#cccccc") {
        return parseInt(0.2*zDepth/zStep);
    }
    if (color=== "#e6e6e6") {
        return parseInt(0.1*zDepth/zStep);
    }
    return 0;
}
function setGlobalGrooveHeight(passNumber){
    grooveHeight = 0.5 + passNumber*zStep;
}
function retractSpindle(gcode){
    gcode = gcode + "G90\n";
    gcode = gcode + "G0 Z-" + rtct + "\n";
    gcode = gcode + "G4 P0.25" + "\n";
    gcode = gcode + "G90\n";
    return gcode;
};
function plungeSpindle(gcode, mode){
    gcode = gcode + "G90\n";
    gcode = gcode + "G0 Z" + grooveHeight + "\n";
    if (mode === "relative") {
        gcode = gcode + "G91\n";
    } else {
        gcode = gcode + "G90\n";
    }
    //gcode = gcode + "G90\n";
    return gcode;
};
function updateGlobalPosition(mode, coord, value) {  
    if (coord === "x" && mode === "relative") {
        xglobal = parseFloat(xglobal) + parseFloat(value);
    } else if (coord === "x" && mode === "absolute") {
        xglobal = parseFloat(value);
    } else if (coord === "y" && mode === "absolute") {
        yglobal = parseFloat(value);
    } else if (coord === "y" && mode === "relative") {
        yglobal = parseFloat(yglobal) + parseFloat(value);
    }
    console.log("GLOBAL POSITION",xglobal, yglobal);
}
function restartGlobalParameters(){
    xglobal = 0.0;
    yglobal = 0.0;
    xpathStart = 0.0;
    ypathStart = 0.0;
    xpathMode = "open";
    ypathMode = "open"; 
}
function updateStartPath(coord, value, mode) {
    if (coord === "x" && mode === "close") {
        xpathMode = "open";
    } else if (coord === "y" && mode === "close") {
        ypathMode = "open";
    } else if (coord === "x" && xpathMode === "open" ) {
        xpathStart = parseFloat(value);
        xpathMode = "close";
    } else if (coord === "y" && ypathMode === "open") {
        ypathStart = parseFloat(value);
        ypathMode = "close";
    }
    console.log("PATH START",xpathStart, ypathStart); 
}
function startPositioningMode(mode,gsrc) {
    if (mode === "relative") {
        gsrc = gsrc + "G91\n";
    } else {
        gsrc = gsrc + "G90\n";
    }
    return gsrc;
}
function parseNum(num){
    return parseFloat(num).toFixed(3);
}