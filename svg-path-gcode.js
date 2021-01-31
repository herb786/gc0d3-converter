// https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
function findAndConvertPathTags(svgDoc) {
    var gcode = "";
    var num = svgDoc.getElementsByTagName("path").length;
    for (i=0; i < num; i++) {
        rect = svgDoc.getElementsByTagName("path")[i];
        console.log(rect);
        points = rect.getAttribute("d");
        style = rect.getAttribute("style");
        stroke = obtainStrokeWidth(style);
        //stroke = Math.round(rect.getAttribute("stroke-width")*10)/10;
        console.log(stroke);
        var mypath = processPathPoints(points);
        gcode = gcode + ";SVG path\n"
        if (ignoreStyle) {
            gcode = simplePath(gcode,mypath);
        } else {
            gcode = gcodePathOutline(gcode,mypath,stroke);
        }  
    }
    return gcode;
}
function simplePath(gcode,mypath) {
    gcode = retractSpindle(gcode);
    gcode = retractSpindle(gcode);
    return gcode;
}
function gcodePathOutline(gcode,mypath,stroke) {
    gcode = gcodePathXYOutline(gcode,mypath,stroke,false);
    gcode = gcodePathXYOutline(gcode,mypath,stroke,true);
    gcode = retractSpindle(gcode);
    return gcode;
}
function gcodePathXYOutline(gcode,mypath,stroke,isY) {
    gcode = retractSpindle(gcode);
    return gcode;
}
function processPathPoints(myPath, mygcode) {
    var subpaths = obtainSubPaths(myPath);
    for (i=0;i<subpaths.length;i++) {
        let subpath = subpaths[i];
        if (subpath.type === "m") {
            mygcode = mygcode + processPathRelativeMoveTo(subpath.points);
        }
    }
}
function obtainSubPaths(myPath) {
    var out = myPath.match(/([atsqzhvlmcLZMCHVQSTA])([^atsqzhvlmcLZMCHVQSTA]*)/g);
    console.log(out);
    var subpaths = [];
    for (i=0; i<out.length-1; i++) {
        var out1 = out[i].match(/([atsqzhvlmcLZMCHVQSTA])([^atsqzhvlmcLZMCHVQSTA]*)/);
        ctype = out1[1].trim();
        cpoints = out1[2].trim();
        subpaths.push({type:ctype,points:cpoints});
        console.log(ctype,cpoints); 
    }
    return subpath; 
};
function processPathAbsoluteMoveTo(tpoints) {

};
function processPathRelativeMoveTo(tpoints) {

};
function processPathAbsoluteLineTo(tpoints) {

};
function processPathRelativeLineTo(tpoints) {

};
function processPathAbsoluteHorizontal(tpoints) {

};
function processPathRelativeHorizontal(tpoints) {

};
function processPathAbsoluteVertical(tpoints) {

};
function processPathRelativeVertical(tpoints) {

};
function processPathClose(tpoints) {

};
function processPathAbsoluteCubicBezier(tpoints) {

};
function processPathRelativeCubicBezier(tpoints) {

};
function processPathAbsoluteSmoothBezier(tpoints) {

};
function processPathRelativeSmoothBezier(tpoints) {

};
function processPathAbsoluteQuadraticBezier(tpoints) {

};
function processPathRelativeQuadraticBezier(tpoints) {

};
function processPathAbsoluteSmoothQuadraticBezier(tpoints) {

};
function processPathRelativeSmoothQuadraticBezier(tpoints) {

};
function processPathAbsoluteArcs(tpoints) {

};
function processPathRelativeArcs(tpoints) {

};