function duplicateLayerOnBeat(bpm) {
    var comp = app.project.activeItem;
    if (!(comp && comp instanceof CompItem)) {
        alert("Please open a composition.");
        return;
    }

    var layer = comp.selectedLayers[0];
    if (!layer) {
        alert("Please select a layer.");
        return;
    }

    app.beginUndoGroup("Duplicate Layer on BPM");

    var frameRate = comp.frameRate;
    var beatsPerSecond = bpm / 60;
    var beatInterval = frameRate / beatsPerSecond; // Frames per beat

    var currentTime = layer.startTime;
    
    for (var i = 1; currentTime < comp.duration; i++) {
        var newLayer = layer.duplicate();
        newLayer.startTime = i * (60 / bpm);
        currentTime = newLayer.startTime;
    }

    app.endUndoGroup();
}

function getCompData() {
    var comp = app.project.activeItem;
    if (!comp || !(comp instanceof CompItem)) {
        return JSON.stringify({ error: "No active composition found." });
    }

    var layers = [];
    for (var i = 1; i <= comp.numLayers; i++) {
        var layer = comp.layer(i);
        layers.push({
            name: layer.name,
            inPoint: layer.inPoint,
            outPoint: layer.outPoint,
            duration: layer.outPoint - layer.inPoint
        });
    }

    var compData = {
        name: comp.name,
        duration: comp.duration,
        frameRate: comp.frameRate,
        width: comp.width,
        height: comp.height,
        layers: layers
    };
    $.writeln(JSON.stringify(compData)); // Debugging output
    return JSON.stringify(compData);
}