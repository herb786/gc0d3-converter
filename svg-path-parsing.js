// https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
// https://www.w3.org/TR/SVG/paths.html#PathData
function obtainFillColor(style) {
    var fill = "#000000";
    if(style!=null) {
        var out = style.match(/fill:(.*?);/);
        if (out != null) {
            fill = out[1];
        }
    }
    return fill;
};
function obtainStrokeColor(style) {
    var fill = "none";
    if(style!=null) {
        var out = style.match(/stroke:(.*?);/);
        if (out != null) {
            fill = out[1];
        }
    }
    return fill;
};
function obtainStrokeWidth(style) {
    var stroke = 0.5;
    if(style!=null) {
        var out = style.match(/stroke-width:(\d+\.?\d*)/);
        var stroke = Math.round(parseFloat(out[1])*10)/10;
    }
    //console.log(stroke);
    return stroke;
};
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
        xcoord = parseFloat(out[i+1].trim());
        ycoord = parseFloat(out[i+2].trim());
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
        xcoord = parseFloat(out[i+1].trim());
        coords.push(xcoord);
        console.log(coords); 
    }
    console.log("coordinates parsed!");
    return coords;
}
function parseMoveCoordinates(tpoints,type) {
    var out = tpoints.match(/(-?\d+\.?\d*)[,\W](-?\d+\.?\d*)?/g);
    console.log(out, out.length);
    var coords = [];
    for (var i=0; i<out.length; i++) {
        var mp = out[i];
        var sp = mp.match(/(-?\d+\.?\d*)[,\W](-?\d+\.?\d*)?/)
        xcoord = parseFloat(sp[1].trim());
        ycoord = parseFloat(sp[2].trim());
        coords.push({x:xcoord,y:ycoord});
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
    //console.log(params);
    console.log("arc parameters parsed!");
    return params;
}
function parseCubicBezierParameters(tpoints) {
    var out = tpoints.match(/(-?\d+\.?\d*)[,\W](-?\d+\.?\d*)\W(-?\d+\.?\d*)[,\W](-?\d+\.?\d*)\W(-?\d+\.?\d*)[,\W](-?\d+\.?\d*)/g)
    console.log(out, out.length);
    var params = [];
    for (var i=0; i<out.length; i++) {
        var mp = out[i];
        var sp = mp.match(/(-?\d+\.?\d*)[,\W](-?\d+\.?\d*)\W(-?\d+\.?\d*)[,\W](-?\d+\.?\d*)\W(-?\d+\.?\d*)[,\W](-?\d+\.?\d*)/)
        //console.log(sp);
        var xcp1 = parseFloat(sp[1].trim());
        var ycp1 = parseFloat(sp[2].trim());
        var xcp2 = parseFloat(sp[3].trim());
        var ycp2 = parseFloat(sp[4].trim());
        var xend = parseFloat(sp[5].trim());
        var yend = parseFloat(sp[6].trim());
        params.push({"xcp1":xcp1,"ycp1":ycp1,"xcp2":xcp2,"ycp2":ycp2,"xend":xend,"yend":yend});
    }
    //console.log(params);
    console.log("cubic bezier parameters parsed!");
    return params;
}
function parseQuadraticBezierParameters(tpoints) {
    var out = tpoints.match(/(-?\d+\.?\d*)[,\W](-?\d+\.?\d*)\W(-?\d+\.?\d*)[,\W](-?\d+\.?\d*)/g)
    console.log(out, out.length);
    var params = [];
    for (var i=0; i<out.length; i++) {
        var mp = out[i];
        var sp = mp.match(/(-?\d+\.?\d*)[,\W](-?\d+\.?\d*)\W(-?\d+\.?\d*)[,\W](-?\d+\.?\d*)/)
        //console.log(sp);
        var xcp1 = parseFloat(sp[1].trim());
        var ycp1 = parseFloat(sp[2].trim());
        var xend = parseFloat(sp[3].trim());
        var yend = parseFloat(sp[4].trim());
        params.push({"xcp1":xcp1,"ycp1":ycp1,"xend":xend,"yend":yend});
    }
    //console.log(params);
    console.log("quadratic bezier parameters parsed!");
    return params;
}
