import React, { useState, useMemo, useRef, useEffect } from "react";
import "./style.scss";
import Toolbar from "./components/Toolbar";
import Timeline from "./components/Timeline";
import Loader from "./components/Loader";

// Main React component
const App = () => {
    // UI loading states
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("");

    // Timeline settings
    const [bpm, setBpm] = useState(120.0); // Beats per minute
    const [beatsPerBar, setBeatsPerBar] = useState(4); // Time signature top number
    const [zoomLevel, setZoomLevel] = useState(1.0); // Controls horizontal zoom of timeline
    const timeSignature = 4; // Used only for display calculation (not editable yet)

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
    const [mode, setMode] = useState("move"); // Either "move" or "scale"
    const modeRef = useRef(mode);
    useEffect(() => {
        modeRef.current = mode;
    }, [mode]);


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
                { index: 1, name: "Layer 01", inPoint: 12, outPoint: 35, duration: 23, color: [Math.random()*255, Math.random()*255, Math.random()*255] },
                { index: 2, name: "Layer 02", inPoint: 5, outPoint: 21, duration: 16, color: [Math.random()*255, Math.random()*255, Math.random()*255] },
                { index: 3, name: "Layer 03", inPoint: 7.8, outPoint: 46, duration: 38.2, color: [Math.random()*255, Math.random()*255, Math.random()*255] },
                { index: 4, name: "Layer 04", inPoint: 1, outPoint: 3, duration: 2, color: [Math.random()*255, Math.random()*255, Math.random()*255] },
                { index: 5, name: "Layer 05", inPoint: 35, outPoint: 48, duration: 13, color: [Math.random()*255, Math.random()*255, Math.random()*255] }
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
            csInterface.evalScript("getCompData()", (result) => {
                try {
                    const data = JSON.parse(result);
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
                    setCompData(data);
                    waitingForAERef.current = false;
                    setLoading(false);
                })
                .catch((error) => console.error("Error fetching comp data:", error));
        }
    };

    // Register event listener: when app regains focus, refresh data
    window.addEventListener("focus", updateView);

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
        <main>
            {loading && <Loader text={loadingText} />}

            <Toolbar
                bpm={bpm}
                setBpm={setBpm}
                beatsPerBar={beatsPerBar}
                setBeatsPerBar={setBeatsPerBar}
                zoomLevel={zoomLevel}
                increaseZoom={increaseZoom}
                decreaseZoom={decreaseZoom}
                updateView={updateView}
                modeSnap={modeSnap}
                setModeSnap={setModeSnap}
                mode={mode}
                setMode={setMode}
                saveCompDataJSON={saveCompDataJSON}
                loadCompDataJSON={loadCompDataJSON}
            />

            <Timeline
                compData={compData}
                bpm={bpm}
                beatsPerBar={beatsPerBar}
                zoomLevel={zoomLevel}
                updateView={updateView}
                waitingForAERef = {waitingForAERef}
                setLoading={setLoading}
                setLoadingText={setLoadingText}
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
    );
};

export default App;