import React, { useState, useMemo, useRef, useEffect } from "react";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';

import "./style.scss";
import Toolbar from "./components/Toolbar";
import Timeline from "./components/Timeline";
import Loader from "./components/Loader";

// Main React component
const App = () => {
    

    const theme = createTheme({
        components: {
            MuiTooltip: {
                styleOverrides: {
                    tooltip: {
                        backgroundColor: 'var(--light-grey)',
                        border: 'solid 1px var(--light)',
                        fontSize: '0.75rem',
                        color: 'var(--lightest)',
                    }
                },
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        backgroundColor: 'var(--light-grey)',
                        border: 'solid 1px var(--light)',
                        fontSize: '1rem',
                        color: 'var(--lightest)',
                        padding: '0.25rem'
                    }
                },
            },
        },
    });

    // UI loading states
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("");
    // UI ALert Dialog
    const [alertVisiblity, setAlertVisiblity] = useState(false);
    const alertTitle = useRef("Alert!");
    const alertText = useRef("Text of the alert.");

    // Timeline settings
    const [bpm, setBpm] = useState(120.0); // Beats per minute
    const [beatsPerBar, setBeatsPerBar] = useState(4); // Time signature top number
    const [zoomLevel, setZoomLevel] = useState(1.0); // Controls horizontal zoom of timeline
    const timeSignature = 4; // Used only for display calculation (not editable yet)
    const [showInactive, setShowInactive] = useState(false); // Controls visibility of inactive (video invisible, audio inactive) layers
    const [showHidden, setShowHidden] = useState(false); // Controls visibility of hidden (shy) layers

    // Track selected layer
    const [selectedLayer, setSelectedLayer] = useState(null);
    const selectedLayerRef = useRef(selectedLayer);

    // Mode Settings
    /* GENERAL MODE WHEN COMMUNICATING WITH AE TO PREVENT CRASHES */
    const [waitingForAE, setWaitingForAE] = useState(false);
    const waitingForAERef = useRef(waitingForAE);
    /* Different modes when using the TL */
    const [modeSnap, setModeSnap] = useState(true);
    const modeSnapRef = useRef(modeSnap);
    useEffect(() => {
        modeSnapRef.current = modeSnap;
    }, [modeSnap]);
    const [mode, setMode] = useState("move"); // Either "select" or "move" or "scale"
    const modeRef = useRef(mode);
    useEffect(() => {
        modeRef.current = mode;
    }, [mode]);
    /* Different settings for action */
    const [actionDuplicateCount, setActionDuplicateCount] = useState(4);
    const [actionDuplicateMode, setActionDuplicateMode] = useState("beats");



    // Zoom controls
    const increaseZoom = () => setZoomLevel(zoomLevel + 0.25);
    const decreaseZoom = () => zoomLevel - 0.25 >= 1.0 ? setZoomLevel(zoomLevel - 0.25) : null;

    // Default (empty) comp structure
    let placeholderCompData = {
        name: "Placeholder Comp",
        duration: 0,
        frameRate: 0,
        width: 0,
        height: 0,
        layers: []
    };

    // If in dev mode, populate comp data with mock layers
    if (__IS_DEV__) {
        placeholderCompData = {
            name: "Dummy Comp",
            duration: 48, // seconds
            frameRate: 30,
            width: 1080,
            height: 1080,
            layers: [
                { index: 1, name: "Layer 01", inPoint: 12, outPoint: 35, duration: 23, shy: false, visible: true, audioActive: false, color: [Math.random()*255, Math.random()*255, Math.random()*255] },
                { index: 2, name: "Layer 02", inPoint: 5, outPoint: 21, duration: 16, shy: false, visible: true, audioActive: false, color: [Math.random()*255, Math.random()*255, Math.random()*255] },
                { index: 3, name: "Layer 03", inPoint: 7.8, outPoint: 46, duration: 38.2, shy: false, visible: true, audioActive: false, color: [Math.random()*255, Math.random()*255, Math.random()*255] },
                { index: 4, name: "Layer 04", inPoint: 1, outPoint: 3, duration: 2, shy: false, visible: true, audioActive: false, color: [Math.random()*255, Math.random()*255, Math.random()*255] },
                { index: 5, name: "Layer 05", inPoint: 35, outPoint: 48, duration: 13, shy: false, visible: true, audioActive: false, color: [Math.random()*255, Math.random()*255, Math.random()*255] }
            ]
        };
    }

    // React state holding composition data
    const [compData, setCompData] = useState(placeholderCompData);

    // Function that fetches composition data from ExtendScript via CEP
    const fetchCompData = async () => {
        return new Promise((resolve, reject) => {
            if (!window.CSInterface) {
                reject("CSInterface is not available. Make sure CSInterface.js is loaded.");
                return;
            }

            const csInterface = new window.CSInterface();
            console.log(csInterface);
            csInterface.evalScript("getCompData()", (result) => {
                try {
                    const data = JSON.parse(result);
                    console.log(data);
                    if (data.error) reject(data.error);
                    else resolve(data);
                } catch (e) {
                    reject("Invalid JSON response from ExtendScript.");
                }
            });
        });
    };

    // Triggers fetch when user switches to the app
    const updateView = () => {
        if (!__IS_DEV__ && !waitingForAERef.current) {
            waitingForAERef.current = true;
            setLoadingText("Fetching Composition Data");
            setLoading(true);
            fetchCompData()
                .then((data) => {
                    console.log("Updating View with Comp Data", data);
                    setCompData(data);
                    waitingForAERef.current = false;
                    setLoading(false);
                })
                .catch((error, data) => {
                    console.error("Error fetching comp data:", error);
                    console.log("Data returned:", data);
                    waitingForAERef.current = false;
                });
        }
    };

    // Register event listener: when app regains focus, refresh data
    window.addEventListener("focus", updateView);

    
    // Function that that duplicates layer with ExtendScript via CEP
    const duplicateAELayer = async (layerIndex, bpm, count, mode) => {
        console.log(layerIndex, bpm, count, mode);
        return new Promise((resolve, reject) => {
            if (!window.CSInterface) {
                reject("CSInterface is not available. Make sure CSInterface.js is loaded.");
                return;
            }

            const csInterface = new window.CSInterface();
            csInterface.evalScript(`duplicateLayer(${layerIndex}, ${bpm}, ${count}, "${mode}")`, (result) => {
                if (result === "success") {
                    resolve();
                } else {
                    reject(result);
                }
            });
        });
    };
    
    const duplicateLayer = async () => {
        // console.log(selectedLayer);
        try {
            if(selectedLayer === null) throw "No Layer selected";
            let layerIndex = selectedLayer.index;
            let count = actionDuplicateCount;
            let mode = actionDuplicateMode;
            if(!__IS_DEV__ && !waitingForAERef.current) {
                waitingForAERef.current = true;
                setLoadingText(`Duplicating Layer for ${count} ${mode}`);
                setLoading(true);
                duplicateAELayer(layerIndex, bpm, count, mode)
                    .then(() => { updateView(); waitingForAERef.current = false; setLoading(false); })
                    .catch((error) => console.error("Error duplicating AE layer:", error));
            }
        } catch (error) {
            console.error(error);
            setAlertVisiblity(true);
            alertTitle.current = "Error!";
            alertText.current = error;
        }
    };

    // Export comp data to .json file
    const saveCompDataJSON = (filename) => {
        const blob = new Blob([JSON.stringify(compData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.json`;
        a.click();
        URL.revokeObjectURL(url);
        console.log(JSON.stringify(compData));
    };

    // Import comp data from a .json file
    const loadCompDataJSON = () => {
        const readFile = function(e) {
            var file = e.target.files[0];
            if (!file) return;
            var reader = new FileReader();
            reader.onload = function(e) {
                var contents = e.target.result;
                fileInput.func(contents);
                document.body.removeChild(fileInput);
            };
            reader.readAsText(file);
        };

        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.style.display = "none";
        fileInput.onchange = readFile;
        fileInput.func = (content) => setCompData(JSON.parse(content));
        document.body.appendChild(fileInput);
        fileInput.click();
    };

    return (
        <ThemeProvider  theme={theme}>
            <main>
                {loading && <Loader text={loadingText} />}

                <Dialog
                    open={alertVisiblity}
                    onClose={() => setAlertVisiblity(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <h1 style={{margin: "0.25rem", color: "var(--warning)", textAlign: "center"}}>{alertTitle.current}</h1>
                    <p style={{margin: "0.25rem"}}>{alertText.current}</p>
                    <button onClick={() =>setAlertVisiblity(false)}>Okay</button>
                </Dialog>

                <Toolbar
                    bpm={bpm}
                    setBpm={setBpm}
                    beatsPerBar={beatsPerBar}
                    setBeatsPerBar={setBeatsPerBar}
                    zoomLevel={zoomLevel}
                    increaseZoom={increaseZoom}
                    decreaseZoom={decreaseZoom}
                    showInactive={showInactive}
                    setShowInactive={setShowInactive}
                    showHidden={showHidden}
                    setShowHidden={setShowHidden}
                    updateView={updateView}
                    modeSnap={modeSnap}
                    setModeSnap={setModeSnap}
                    mode={mode}
                    setMode={setMode}
                    actionDuplicateCount = {actionDuplicateCount}
                    setActionDuplicateCount = {setActionDuplicateCount}
                    actionDuplicateMode = {actionDuplicateMode}
                    setActionDuplicateMode = {setActionDuplicateMode}
                    duplicateLayer = {duplicateLayer}
                    saveCompDataJSON={saveCompDataJSON}
                    loadCompDataJSON={loadCompDataJSON}
                />

                <Timeline
                    compData={compData}
                    bpm={bpm}
                    beatsPerBar={beatsPerBar}
                    zoomLevel={zoomLevel}
                    showInactive={showInactive}
                    showHidden={showHidden}
                    updateView={updateView}
                    waitingForAERef = {waitingForAERef}
                    setLoading={setLoading}
                    setLoadingText={setLoadingText}
                    setSelectedLayer = {setSelectedLayer}
                    modeSnapRef={modeSnapRef}
                    modeRef={modeRef}
                />

                <div id="information">
                    <hr />
                    <p>
                        <small>
                            comp duration: {compData.duration} seconds |
                            total beats: {Math.floor(compData.duration * (bpm / 60 * (beatsPerBar / 4)))} |
                            total bars: {Math.ceil((Math.floor(compData.duration * (bpm / 60 * (timeSignature / 4)))) / timeSignature)} |
                            beats per second: { bpm / 60 * (beatsPerBar / 4)}
                        </small>
                    </p>
                </div>
            </main>
        </ ThemeProvider >
    );
};

export default App;