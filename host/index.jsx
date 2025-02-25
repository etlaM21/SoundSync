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