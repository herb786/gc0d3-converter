//var gcode;
// https://developer.mozilla.org/en-US/docs/Web/SVG/Element
// http://linuxcnc.org/docs/html/
var parser, zStep, speed, rtct, step, bitd, ignoreStyle, grooveHeight;
var xglobal, yglobal;
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
function obtainFillColor(style) {
    var out = style.match(/fill:(.*?);/);
    var fill = out[1];
    return fill;
};
function obtainStrokeColor(style) {
    var out = style.match(/stroke:(.*?);/);
    var fill = out[1];
    return fill;
};
function obtainStrokeWidth(style) {
    var out = style.match(/stroke-width:(\d+\.?\d*)/);
    var stroke = Math.round(parseFloat(out[1])*10)/10;
    //console.log(stroke);
    return stroke;
};
function getGrooveStepsGrayscale(color) {
    if (color=== "#000000") {
        return parseInt(zDepth/zStep);
    }
    if (color=== "#4d4d4d") {
        return parseInt(0.7*zDepth/zStep);
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
function plungeSpindle(gcode){
    gcode = gcode + "G90\n";
    gcode = gcode + "G0 Z" + grooveHeight + "\n";
    gcode = gcode + "G90\n";
    return gcode;
};