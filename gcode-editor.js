//var gcode;
var task = document.getElementById("task");
var result = document.getElementById("result");
var loadgcode = document.getElementById("loadgcode");
var copycode = document.getElementById("copycode");
//var savecode = document.getElementById("savecode");
var disk = document.getElementById("disk");
var clear = document.getElementById("clear");
clear.addEventListener('click', event => {
    task.value = "";
    result.value = "";
});
//savecode.addEventListener('click', event => {});
loadgcode.addEventListener('click', event => {
    var gcode = task.value;
    console.log("Loaded!");
    result.value = analizeLines(gcode);
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
function analizeLines(gcode) {
    var newGcode = "";
    var lines = gcode.split('\n');
    console.log(document.getElementById("zramp").value);
    var zStep = parseFloat(document.getElementById("zramp").value);
    console.log(document.getElementById("speed").value);
    var speed = document.getElementById("speed").value;
    var rtct = document.getElementById("retraction").value;
    sinkAction = false;
    for (var i = 1; i < lines.length; i++) {
        //console.log(lines[i]);
        if (lines[i].includes("M3")) {
            sinkAction = false;
            newGcode = newGcode + lines[i].replace(/S\d+/g,'S0') + "\n";
            //console.log("M3 detected");
        } else if (lines[i].includes("M5")) {
            sinkAction = false;
            newGcode = newGcode + lines[i] + "\n" + "G0 Z-" + rtct + "\n" + "G4 P0.25" + "\n";
            //console.log("M5 detected");
        } else if (checkLaserOff(lines[i])) {
            // test dwell code
            newGcode = newGcode + "G0 Z-" + rtct + "\n" + "G4 P0.25" + "\n";
            sinkAction = false;
            console.log("S0 detected");
        } else if (lines[i].includes("S")) {
            gline = lines[i].replace(/S\d+/g,'');
            //console.log(gline);
            if (analizeXYDistance(lines[i], lines[i-1])) {
                newGcode = newGcode + "G0 Z-" + rtct + "\n" + "G4 P0.25" + "\n" + gline + "\n" +  "G0 Z" +  zStep + "\n";
                sinkAction = true;
                console.log("Laser noise detected");
            } else if (sinkAction) {
                newGcode = newGcode + gline + "\n"; 
            } else {
                newGcode = newGcode + gline + speed + "\n" +  "G0 Z" +  zStep + "\n";
                sinkAction = true;
            }
        } else if (lines[i].includes("sinks")) {
            zStep = zStep + 0.5;
        } else {
            newGcode = newGcode + lines[i] + "\n";
        }
    }
    return newGcode;
}
function analizeXYDistance(line1,line2) {
    var paxis = document.getElementsByName('axis');
    if (line1.includes("G1")){
        return false;
    } else {
        return analizeYDistance(line1,line2) || analizeXDistance(line1,line2);
    }
}
function analizeYDistance(line1,line2) {
    var out1 = line1.match(/Y(\d+\.?\d*)/);
    var out2 = line2.match(/Y(\d+\.?\d*)/);
    //console.log(out1,out2);
    if (out1 && out2) {
        var y1 = parseFloat(out1[1]);
        var y2 = parseFloat(out2[1]);
        if (Math.abs(y1 - y2) > 0.5) {
            return true;
        }
    }
    return false;
}
function analizeXDistance(line1,line2) {
    var out1 = line1.match(/X(\d+\.?\d*)/);
    var out2 = line2.match(/X(\d+\.?\d*)/);
    if (out1 && out2) {
        var y1 = parseFloat(out1[1]);
        var y2 = parseFloat(out2[1]);
        if (Math.abs(y1 - y2) > 0.5) {
            return true;
        }
    }
    return false;
}
function checkLaserPowerThreshold(line) {
    var out = line.match(/S(\d+)/);
    //console.log(out);
    var power = parseFloat(out[1]);
    var src = document.getElementById("power").value;
    var out = src.match(/S(\d+)/);
    //console.log(out);
    var psrc = parseFloat(out[1]);
    var thsrc = document.getElementById("powerth").value;
    var out = thsrc.match(/S(\d+)/);
    var pctPowerThreshold = parseFloat(out[1]);;
    //console.log(power,psrc);
    if (power < pctPowerThreshold) {
        return true;
    }
    return false;
}
function checkLaserOff(line) {
    var reX = /^S0/g;
    var x = line.match(reX)
    //console.log(x);
    if ( x != null && x[0] ===  "S0") {
        return true;
    }
    return false;
}