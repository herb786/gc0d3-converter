// https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
// https://www.w3.org/TR/SVG/paths.html#PathData
// Be careful with the loops, always start with the statement var, otherwise you will find some infinite loops
function findAndConvertPathTags(svgDoc) {
    var gcode = "";
    var num = svgDoc.getElementsByTagName("path").length;
    for (var i=0; i < num; i++) {
        restartGlobalParameters();
        elem = svgDoc.getElementsByTagName("path")[i];
        console.log(elem);
        var mypath = elem.getAttribute("d");
        style = elem.getAttribute("style");
        stroke = obtainStrokeWidth(style);
        fill = obtainFillColor(style);
        color = obtainStrokeColor(style);
        console.log(stroke);
        gcode = gcode + ";SVG path\n"
        if (fill === "none") {
            groovePasses = getGrooveStepsGrayscale(color);
        } else {
            groovePasses = getGrooveStepsGrayscale(fill);
        }
        for (var k=0;k<groovePasses;k++) {
            restartGlobalParameters();
            setGlobalGrooveHeight(k);
            if (ignoreStyle) {
                gcode = simplePath(gcode,mypath);
            } else if (fill != "none") {
                gcode = simplePath(gcode,mypath);
            } else if (bitd > stroke-0.5){
                gcode = simplePath(gcode,mypath);
            } else {
                gcode = gcodePathOutline(gcode,mypath,stroke);
            }
        }
    }
    return gcode;
}
function simplePath(gcode,mypath) {
    gcode = retractSpindle(gcode);
    gcode = processPathPoints(mypath, gcode);
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
    console.log(subpaths);
    for (var i=0;i<subpaths.length;i++) {
        console.log("subpath index",i);
        let subpath = subpaths[i];
        console.log(subpath);
        if (subpath.type === "m") {
            mygcode = mygcode + ";SVG relative move\n";
            mygcode = mygcode + processPathMoveTo(subpath.points, "relative");
            console.log("m path converted");
        }
        if (subpath.type === "M") {
            mygcode = mygcode + ";SVG absolute move\n";
            mygcode = mygcode + processPathMoveTo(subpath.points, "absolute");
            console.log("M path converted");
        }
        if (subpath.type === "V") {
            mygcode = mygcode + ";SVG vertical line\n";
            mygcode = mygcode + processPathVertical(subpath.points, "absolute");
            console.log("V path converted");
        }
        if (subpath.type === "v") {
            mygcode = mygcode + ";SVG vertical line\n";
            mygcode = mygcode + processPathVertical(subpath.points, "relative");
            console.log("v path converted");
        }
        if (subpath.type === "H") {
            mygcode = mygcode + ";SVG horizontal line\n";
            mygcode = mygcode + processPathHorizontal(subpath.points, "absolute");
            console.log("H path converted");
        }
        if (subpath.type === "h") {
            mygcode = mygcode + ";SVG horizontal line\n";
            mygcode = mygcode + processPathHorizontal(subpath.points, "relative");
            console.log("h path converted");
        }
        if (subpath.type === "L") {
            mygcode = mygcode + ";SVG absolute line\n";
            mygcode = mygcode + processPathLineTo(subpath.points, "absolute");
            console.log("L path converted");
        }
        if (subpath.type === "l") {
            mygcode = mygcode + ";SVG relative line\n";
            mygcode = mygcode + processPathLineTo(subpath.points, "relative");
            console.log("l path converted");
        }
        if (subpath.type === "A") {
            mygcode = mygcode + ";SVG absolute arc\n";
            mygcode = mygcode + processPathArcs(subpath.points, "absolute");
            console.log("A path converted");
        }
        if (subpath.type === "a") {
            mygcode = mygcode + ";SVG relative arc\n";
            mygcode = mygcode + processPathArcs(subpath.points, "relative");
            console.log("a path converted");
        }
        if (subpath.type === "z") {
            mygcode = mygcode + ";SVG relative close\n";
            mygcode = mygcode + processClosePath();
            console.log("z path converted");
        }
        if (subpath.type === "Z") {
            mygcode = mygcode + ";SVG absolute close\n";
            mygcode = mygcode + processClosePath();
            console.log("Z path converted");
        }
        if (subpath.type === "C") {
            mygcode = mygcode + ";SVG absolute cubic bezier\n";
            mygcode = mygcode + processPathCubicBezier(subpath.points, "absolute");
            console.log("C path converted");
        }
        if (subpath.type === "c") {
            mygcode = mygcode + ";SVG relative cubic bezier\n";
            mygcode = mygcode + processPathCubicBezier(subpath.points, "relative");
            console.log("c path converted");
        }
        if (subpath.type === "Q") {
            mygcode = mygcode + ";SVG absolute quadratic bezier\n";
            mygcode = mygcode + processPathQuadraticBezier(subpath.points, "absolute");
            console.log("Q path converted");
        }
        if (subpath.type === "q") {
            mygcode = mygcode + ";SVG relative quadratic bezier\n";
            mygcode = mygcode + processPathQuadraticBezier(subpath.points, "relative");
            console.log("q path converted");
        }
    }
    return mygcode;
}

function processPathMoveTo(tpoints, mode) {
    var gsrc = "";
    coords = parseMoveCoordinates(tpoints);
    //console.log(coords);
    gsrc = retractSpindle(gsrc);
    for (var i=0;i<coords.length;i++) {
        gsrc = gsrc + ";SVG move path " + i + "\n";
        pos = coords[i];
        console.log(pos);
        if (i==0) {
            gsrc = gsrc + "G0 X" + parseNum(pos.x) + " Y" + parseNum(pos.y) + "\n";
        } else {
            gsrc = plungeSpindle(gsrc, mode);
            gsrc = gsrc + "G1 X" + parseNum(pos.x) + " Y" + parseNum(pos.y) + "\n";
        }
        updateGlobalPosition(mode,"x", pos.x);
        updateGlobalPosition(mode,"y", pos.y);
        updateStartPath("x", xglobal, "open") 
        updateStartPath("y", yglobal, "open") 
    }
    return gsrc;
};
function processPathLineTo(tpoints, mode) {
    var gsrc = "";
    coords = parseMoveCoordinates(tpoints);
    for (var i=0;i<coords.length;i++) {
        gsrc = gsrc + ";SVG line path " + i + "\n";
        pos = coords[i];
        console.log(pos);
        gsrc = plungeSpindle(gsrc, mode);
        gsrc = gsrc + "G1 X" + parseNum(pos.x) + " Y" + parseNum(pos.y) + "\n";
        updateGlobalPosition(mode,"x", pos.x);
        updateGlobalPosition(mode,"y", pos.y);
    }
    return gsrc;
};
function processClosePath() {
    var gsrc = "";
    gsrc = plungeSpindle(gsrc, "absolute");
    gsrc = gsrc + "G1 X" + parseNum(xpathStart) + " Y" + parseNum(ypathStart) + "\n";
    gsrc = retractSpindle(gsrc);
    updateGlobalPosition("absolute","x", xpathStart); 
    updateGlobalPosition("absolute","y", ypathStart); 
    updateStartPath("x", 1, "close");
    updateStartPath("y", 1, "close");
    return gsrc;
}
function processPathHorizontal(tpoints,mode) {
    var gsrc = "";
    coords = parseSingleCoordinate(tpoints);
    posx = coords[0];
    gsrc = plungeSpindle(gsrc, mode);
    gsrc = gsrc + "G1 X" + parseNum(posx)+ "\n";
    updateGlobalPosition(mode,"x", posx);    
    return gsrc;
};
function processPathVertical(tpoints, mode) {
    var gsrc = "";
    coords = parseSingleCoordinate(tpoints);
    posy = coords[0];
    gsrc = plungeSpindle(gsrc, mode);
    gsrc = gsrc + "G1 Y" + parseNum(posy) + "\n";
    updateGlobalPosition(mode,"y", posy);
    return gsrc;
};
function processPathArcs(tpoints,mode) {
    var gsrc = "";
    gsrc = plungeSpindle(gsrc, "absolute");
    var params = parseArcParameters(tpoints);
    for (var j=0; j<params.length;j++){
        gsrc = gsrc + ";SVG arc path " + j + "\n";
        var pms = params[j];
        console.log(pms);
        var rx = parseFloat(pms.rx);
        var ry = parseFloat(pms.ry);
        var rot = parseFloat(pms.phi);
        var arc = parseFloat(pms.fa);
        var sweep = parseFloat(pms.fs);
        var xend = parseFloat(pms.dx);
        var yend = parseFloat(pms.dy);
        if (mode == "relative") {
            xend = parseFloat(xglobal) + parseFloat(xend);
            yend = parseFloat(yglobal) + parseFloat(yend);
        }
        var coords = computeDrawingParameter(xglobal,yglobal,xend,yend,rx,ry,rot,arc,sweep)
        for (var i=0;i<coords.length;i++) {
            pos = coords[i];
            gsrc = gsrc + "G1 X" + parseNum(pos.x) + " Y" + parseNum(pos.y) + "\n";
        }
        updateGlobalPosition("absolute","x", xend);
        updateGlobalPosition("absolute","y", yend);
    };
    return gsrc;
};
function processPathCubicBezier(tpoints, mode) {
    var gsrc = "";
    gsrc = plungeSpindle(gsrc, "absolute");
    var params = parseCubicBezierParameters(tpoints);
    for (var j=0; j<params.length;j++){
        gsrc = gsrc + ";SVG cubic bezier path " + j + "\n";
        var pms = params[j];
        console.log(pms);
        var xcp1 = parseFloat(pms.xcp1);
        var ycp1 = parseFloat(pms.ycp1);
        var xcp2 = parseFloat(pms.xcp2);
        var ycp2 = parseFloat(pms.ycp2);
        var xend = parseFloat(pms.xend);
        var yend = parseFloat(pms.yend);
        if (mode == "relative") {
            xcp1 = parseFloat(xglobal) + parseFloat(pms.xcp1);
            ycp1 = parseFloat(yglobal) + parseFloat(pms.ycp1);
            console.log(xcp1, ycp1);
            xcp2 = parseFloat(xcp1) + parseFloat(pms.xcp2);
            ycp2 = parseFloat(ycp1) + parseFloat(pms.ycp2);
            //console.log(xcp2, ycp2);
            xend = parseFloat(xcp1) + parseFloat(xend);
            yend = parseFloat(ycp1) + parseFloat(yend);
            //console.log(xend, yend);
        }
        var coords = computeCubicBezierDrawingParameter(xglobal,yglobal,xcp1,ycp1,xcp2,ycp2,xend,yend);
        for (var i=0;i<coords.length;i++) {
            pos = coords[i];
            gsrc = gsrc + "G1 X" + parseNum(pos.x) + " Y" + parseNum(pos.y) + "\n";
        }
        updateGlobalPosition("absolute","x", xend);
        updateGlobalPosition("absolute","y", yend);
    }
    return gsrc;
};
function processPathQuadraticBezier(tpoints,mode) {
    var gsrc = "";
    gsrc = plungeSpindle(gsrc, "absolute");
    var params = parseQuadraticBezierParameters(tpoints);
    for (var j=0; j<params.length;j++){
        gsrc = gsrc + ";SVG quadratic bezier path " + j + "\n";
        var pms = params[j];
        console.log(pms);
        var xcp1 = parseFloat(pms.xcp1);
        var ycp1 = parseFloat(pms.ycp1);
        var xend = parseFloat(pms.xend);
        var yend = parseFloat(pms.yend);
        if (mode == "relative") {
            xcp1 = parseFloat(xglobal) + parseFloat(pms.xcp1);
            ycp1 = parseFloat(yglobal) + parseFloat(pms.ycp1);
            //console.log(xcp1, ycp1);
            xend = parseFloat(xglobal) + parseFloat(xend);
            yend = parseFloat(yglobal) + parseFloat(yend);
            //console.log(xend, yend);
        }
        var coords = computeQuadraticBezierDrawingParameter(xglobal,yglobal,xcp1,ycp1,xend,yend);
        for (var i=0;i<coords.length;i++) {
            pos = coords[i];
            gsrc = gsrc + "G1 X" + parseNum(pos.x) + " Y" + parseNum(pos.y) + "\n";
        }
        updateGlobalPosition("absolute","x", xend);
        updateGlobalPosition("absolute","y", yend);
    }
    return gsrc;
};
function processPathAbsoluteSmoothBezier(tpoints) {

};
function processPathRelativeSmoothBezier(tpoints) {

};
function processPathAbsoluteSmoothQuadraticBezier(tpoints) {

};
function processPathRelativeSmoothQuadraticBezier(tpoints) {

};