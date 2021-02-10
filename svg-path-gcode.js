// https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
// https://www.w3.org/TR/SVG/paths.html#PathData
// Be careful with the loops, always start with the statement var, otherwise you will find some infinite loops
function findAndConvertPathTags(svgDoc) {
    var gcode = "";
    var num = svgDoc.getElementsByTagName("path").length;
    for (var i=0; i < num; i++) {
        rect = svgDoc.getElementsByTagName("path")[i];
        console.log(rect);
        var mypath = rect.getAttribute("d");
        style = rect.getAttribute("style");
        stroke = obtainStrokeWidth(style);
        //stroke = Math.round(rect.getAttribute("stroke-width")*10)/10;
        console.log(stroke);
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
            mygcode = mygcode + processPathMoveTo(subpath.points, "relative");
            console.log("m path converted");
        }
        if (subpath.type === "M") {
            mygcode = mygcode + processPathMoveTo(subpath.points, "absolute");
            console.log("M path converted");
        }
        if (subpath.type === "V") {
            mygcode = mygcode + processPathVertical(subpath.points, "absolute");
            console.log("V path converted");
        }
        if (subpath.type === "v") {
            mygcode = mygcode + processPathVertical(subpath.points, "relative");
            console.log("v path converted");
        }
        if (subpath.type === "H") {
            mygcode = mygcode + processPathHorizontal(subpath.points, "absolute");
            console.log("H path converted");
        }
        if (subpath.type === "h") {
            mygcode = mygcode + processPathHorizontal(subpath.points, "relative");
            console.log("h path converted");
        }
        if (subpath.type === "L") {
            mygcode = mygcode + processPathLineTo(subpath.points, "absolute");
            console.log("L path converted");
        }
        if (subpath.type === "l") {
            mygcode = mygcode + processPathLineTo(subpath.points, "relative");
            console.log("l path converted");
        }
        if (subpath.type === "A") {
            mygcode = mygcode + processPathArcs(subpath.points, "absolute");
            console.log("A path converted");
        }
        if (subpath.type === "a") {
            mygcode = mygcode + processPathArcs(subpath.points, "relative");
            console.log("a path converted");
        }
    }
    return mygcode;
}
function obtainSubPaths(myPath) {
    var out = myPath.match(/([atsqzhvlmcLZMCHVQSTA])([^atsqzhvlmcLZMCHVQSTA]*)/g);
    console.log(out);
    var subpaths = [];
    for (var i=0; i<out.length; i++) {
        var out1 = out[i].match(/([atsqzhvlmcLZMCHVQSTA])([^atsqzhvlmcLZMCHVQSTA]*)/);
        ctype = out1[1].trim();
        cpoints = "closed";
        if (ctype != "Z" || ctype != "z") {
            cpoints = out1[2].trim();
        }
        subpaths.push({type:ctype,points:cpoints});
        //console.log(ctype,cpoints); 
    }
    console.log("subpaths recognized!");
    return subpaths; 
};
function parseCoordinates(tpoints,type) {
    var out = tpoints.match(/(-?\d+\.?\d*),?(-?\d+\.?\d*)?/);
    console.log(out, out.length);
    var coords = [];
    for (var i=0; i<out.length; i=i+3) {
        xcoord = parseFloat(out[i+1].trim()).toFixed(2);
        ycoord = parseFloat(out[i+2].trim()).toFixed(2);
        coords.push({x:xcoord,y:ycoord});
        console.log(coords); 
    }
    console.log("coordinates parsed!");
    return coords;
}
function parseSingleCoordinate(tpoints) {
    var out = tpoints.match(/(-?\d+\.?\d*)/)
    console.log(out, out.length);
    var coords = [];
    for (var i=0; i<out.length; i=i+2) {
        xcoord = parseFloat(out[i+1].trim()).toFixed(2);
        coords.push(xcoord);
        console.log(coords); 
    }
    console.log("coordinates parsed!");
    return coords;
}
function parseArcParameters(tpoints) {
    var out = tpoints.match(/(-?\d+\.?\d*),(-?\d+\.?\d*)\W(-?\d+\.?\d*)\W([01])\W([01])\W(-?\d+\.?\d*),(-?\d+\.?\d*)/g)
    console.log(out, out.length);
    var params = [];
    for (var i=0; i<out.length; i++) {
        var mp = out[i];
        var sp = mp.match(/(-?\d+\.?\d*),(-?\d+\.?\d*)\W(-?\d+\.?\d*)\W([01])\W([01])\W(-?\d+\.?\d*),(-?\d+\.?\d*)/)
        console.log(sp);
        var rx = parseFloat(sp[1].trim()).toFixed(2);
        var ry = parseFloat(sp[2].trim()).toFixed(2);
        var phi = parseFloat(sp[3].trim()).toFixed(2);
        var fa = parseInt(sp[4].trim());
        var fs = parseInt(sp[5].trim());
        var dx = parseFloat(sp[6].trim()).toFixed(2);
        var dy = parseFloat(sp[7].trim()).toFixed(2);
        params.push({"rx":rx,"ry":ry,"phi":phi,"fa":fa,"fs":fs,"dx":dx,"dy":dy});
    }
    console.log(params);
    console.log("parameters parsed!");
    return params;
}
function startPositioningMode(mode,gsrc) {
    if (mode === "relative") {
        gsrc = gsrc + "G91\n";
    } else {
        gsrc = gsrc + "G90\n";
    }
    return gsrc;
}
function processPathMoveTo(tpoints, mode) {
    var gsrc = "";
    coords = parseCoordinates(tpoints);
    gsrc = retractSpindle(gsrc);
    gsrc = gsrc + startPositioningMode(mode, gsrc);
    for (var i=0;i<coords.length;i++) {
        pos = coords[i];
        if (i==0) {
            gsrc = gsrc + "G0 X" + parseFloat(pos.x).toFixed(2) + " Y" + parseFloat(pos.y).toFixed(2) + "\n";
        } else {
            gsrc = gsrc + "G1 X" + parseFloat(pos.x).toFixed(2) + " Y" + parseFloat(pos.y).toFixed(2) + "\n";
        }
        updateGlobalPosition(mode,"x", pos.x);
        updateGlobalPosition(mode,"y", pos.y);
    }
    return gsrc;
};
function processPathLineTo(tpoints, mode) {
    var gsrc = "";
    coords = parseCoordinates(tpoints);
    gsrc = gsrc + startPositioningMode(mode, gsrc);
    for (var i=0;i<coords.length;i++) {
        pos = coords[i];
        gsrc = gsrc + "G1 X" + parseFloat(pos.x).toFixed(2) + " Y" + parseFloat(pos.y).toFixed(2) + "\n";
        updateGlobalPosition(mode,"x", pos.x);
        updateGlobalPosition(mode,"y", pos.y);
    }
    return gsrc;
};
function processPathHorizontal(tpoints,mode) {
    var gsrc = "";
    gsrc = gsrc + startPositioningMode(mode, gsrc);
    coords = parseSingleCoordinate(tpoints);
    posx = coords[0];
    gsrc = gsrc + "G1 X" + parseFloat(posx).toFixed(2) + "\n";
    updateGlobalPosition(mode,"x", posx);    
    return gsrc;
};
function processPathVertical(tpoints, mode) {
    var gsrc = "";
    gsrc = gsrc + startPositioningMode(mode, gsrc);
    coords = parseSingleCoordinate(tpoints);
    posy = coords[0];
    gsrc = gsrc + "G1 Y" + parseFloat(posy).toFixed(2) + "\n";
    updateGlobalPosition(mode,"y", posy);
    return gsrc;
};
function processPathArcs(tpoints,mode) {
    var gsrc = "";
    gsrc = gsrc + startPositioningMode("absolute", gsrc);
    var params = parseArcParameters(tpoints);
    for (var j=0; j<params.length;j++){
        var pms = params[j];
        console.log(pms);
        var rx = pms.rx;
        var ry = pms.ry;
        var rot = pms.phi;
        var arc = pms.fa;
        var sweep = pms.fs;
        var xend = pms.dx;
        var yend = pms.dy;
        if (mode == "relative") {
            xend = xglobal + xend;
            yend = yglobal + yend;
        }
        var coords = computeDrawingParameter(xglobal,yglobal,xend,yend,rx,ry,rot,arc,sweep)
        for (var i=0;i<coords.length;i++) {
            pos = coords[i];
            gsrc = gsrc + "G1 X" + parseFloat(pos.x).toFixed(2) + " Y" + parseFloat(pos.y).toFixed(2) + "\n";
        }
        updateGlobalPosition("absolute","x", xend);
        updateGlobalPosition("absolute","y", yend);
    };
    return gsrc;
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
function updateGlobalPosition(mode, coord,value) {
    if (coord === "x" && mode === "relative") {
        xglobal = xglobal + value;
    } else if (coord === "x" && mode === "absolute") {
        xglobal = value;
    } else if (coord === "y" && mode === "absolute") {
        yglobal = value;
    } else if (coord === "y" && mode === "relative") {
        yglobal = yglobal + value;
    }
    console.log("GLOBAL POSITION",xglobal, yglobal);
}