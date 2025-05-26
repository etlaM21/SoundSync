/*
*
* HELPER FUNCTIONS
*
*/

/*
* Get Layer Color by looking into the After Effects preference to extract the label color info
* By stib: https://github.com/stibinator/AEScripts/blob/master/ScriptUI%20Panels/simplify%20duik%20icons.jsx#L283
*/

function readLabelColoursFromPrefs() {
    try {
        // returns an array of colour objects corresponding to the label colours in the user's prefs
        // colours are 8-bit rgb values with r g and b components
        // eg. [{r: 255, g: 123, b:0}]
        app.preferences.saveToDisk(); //flush any unsaved prefs to disk
        var versionStr = "" + app.version.match(/([0-9]+.[0-9]+)/)[1];
        var prefsFilePath =
            Folder.userData.absoluteURI +
            "/Adobe/After Effects/" +
            versionStr +
            "/Adobe After Effects " +
            versionStr +
            " Prefs-indep-general.txt";
        var prefs = new File(prefsFilePath);
        // var labelColours = [];
        // lets make rainbows
        //note that label colours are 1-indexed because wtf adobe!?
        // so label[16] exists
        // also, label[0] is no label.
        var labelColours = [{ r: 128, g: 128, b: 128 }]; // no label
        // in case somt goes wrong reading the prefs. Shouldn't happen (but did)
        for (var c = 1; c <= 16; c++) {
            var colour = {};
            var ph = (c / 16) * Math.PI;

            colour.r = Math.pow(Math.cos(ph), 2) * 256;
            colour.g = Math.pow(Math.cos(ph - (2 * Math.PI) / 3), 2) * 256;
            colour.b = Math.pow(Math.cos(ph + (2 * Math.PI) / 3), 2) * 256;
            labelColours[c] = colour;
        }
        if (prefs.exists) {
            prefs.open("r");
            var line = prefs.readln();
            var notDoneYet = true;
            while (!prefs.eof & notDoneYet) {
                if (line.match(/\["Label Preference Color Section.*/)) {
                    line = prefs.readln();
                    while (line) {
                        var labelNum = line.match(
                            /"Label Color ID 2 # ([0-9]+)"/
                        );
                        var labelVal = line.match(/.*= FF(.*)/);
                        var encodedData = labelVal[1];
                        var inQuotes = false;
                        var colourStr = "";
                        var colour = {
                            r: 0,
                            g: 0,
                            b: 0,
                        };
                        for (var i = 0; i < encodedData.length; i++) {
                            if (encodedData[i] === '"') {
                                inQuotes = !inQuotes;
                            } else {
                                if (inQuotes) {
                                    colourStr += encodedData
                                        .charCodeAt(i)
                                        .toString(16);
                                } else {
                                    colourStr += encodedData[i];
                                }
                            }
                        }

                        colour.r = parseInt(colourStr.slice(0, 2), 16);
                        colour.g = parseInt(colourStr.slice(2, 4), 16);
                        colour.b = parseInt(colourStr.slice(4), 16);
                        // label colours aren't stored in numerical order, but in alphabetical order, I think.
                        // Anyway parsing the labelNum assigns the right label to the right index.
                        labelColours[parseInt(labelNum[1], 10)] = colour;
                        line = prefs.readln();
                    }
                    notDoneYet = false;
                }
                line = prefs.readln();
            }
            prefs.close();
        }
        return labelColours;
    } catch (e) {
        alert(e);
        return false;
    }
}

var userLabelColours = readLabelColoursFromPrefs();

function getLabelColour(theLayer) {
    if (!userLabelColours) {
        userLabelColours = readLabelColoursFromPrefs();
    }
    var label = theLayer.label;
    return [
        userLabelColours[label].r,
        userLabelColours[label].g,
        userLabelColours[label].b
    ];
}

/*
*
* Actual Functions called via Script UI CEP Extension
*
*/

/*
* duplicateLayerOnBeat
* Duplicates the selected layer across the comp, spaced by beats based on given BPM.
* Each duplicate is placed at multiples of the beat interval.
*/
function duplicateLayerOnBeat(bpm) {
    var comp = app.project.activeItem;

    // Ensure a composition is open and active
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
    var beatInterval = frameRate / beatsPerSecond; // Frames per beat (not used explicitly but could be for future frame calculations)

    var currentTime = layer.startTime;

    // Duplicate layer, placing each new one at increments of beat duration (seconds)
    for (var i = 1; currentTime < comp.duration; i++) {
        var newLayer = layer.duplicate();
        newLayer.startTime = i * (60 / bpm);
        currentTime = newLayer.startTime;
    }

    app.endUndoGroup();
}

/*
* getCompData
* Returns JSON string with comp and layer info:
* - comp name, duration, frame rate, size
* - array of layers with index, name, inPoint, outPoint, duration, and label color RGB
*/
function getCompData() {
    var comp = app.project.activeItem;

    // Validate active composition
    if (!comp || !(comp instanceof CompItem)) {
        return JSON.stringify({ error: "No active composition found." });
    }

    var layers = [];
    // Loop through all layers to collect their data
    for (var i = 1; i <= comp.numLayers; i++) {
        var layer = comp.layer(i);
        layers.push({
            index: layer.index,
            name: layer.name,
            inPoint: layer.inPoint,
            outPoint: layer.outPoint,
            duration: layer.outPoint - layer.inPoint,
            color: getLabelColour(layer)
        });
    }

    // Compose comp data object
    var compData = {
        name: comp.name,
        duration: comp.duration,
        frameRate: comp.frameRate,
        width: comp.width,
        height: comp.height,
        layers: layers
    };

    $.writeln(JSON.stringify(compData)); // Debugging output to console

    return JSON.stringify(compData);
}

/*
* moveLayer
* Moves the start time of a given layer (by index) to a new time position.
* Returns status string.
*/
function moveLayer(layerIndex, newIn) {
    var comp = app.project.activeItem;

    // Validate active composition
    if (!comp || !(comp instanceof CompItem)) {
        return "No active composition found";
    }

    var layer = comp.layer(layerIndex);
    if (!layer) {
        return "Layer not found";
    }

    app.beginUndoGroup("Move Layer some Beats");

    // Update the layer's start time to the new position
    layer.startTime = newIn;

    app.endUndoGroup();

    return "success";
}