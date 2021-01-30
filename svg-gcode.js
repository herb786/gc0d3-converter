//var gcode;
// https://developer.mozilla.org/en-US/docs/Web/SVG/Element
// http://linuxcnc.org/docs/html/
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
    newGcode = newGcode + findAndConvertEllipseTags(svgDoc);
    newGcode = newGcode + "M5\n";
    newGcode = newGcode + "G0 X0 Y0 Z-5 (move back to origin)\n";
    return newGcode;
}
function findAndConvertLineTags(svgDoc) {
}
function findAndConvertPolygonTags(svgDoc) {
}
function findAndConvertPolylineTags(svgDoc) {
}
function findAndConvertPathTags(svgDoc) {
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