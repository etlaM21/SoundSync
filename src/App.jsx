import React, { useState, useMemo, useRef, useEffect } from "react";
import "./style.scss";
import Toolbar from "./components/Toolbar";
import Timeline from "./components/Timeline";

const App = () => {
    const [bpm, setBpm] = useState(120.0);
    const [beatsPerBar, setBeatsPerBar] = useState(4);
    const [zoomLevel, setZoomLevel] = useState(1.0);
    const timeSignature = 4;

    const increaseZoom = () => setZoomLevel(zoomLevel + 0.25);
    const decreaseZoom = () => zoomLevel - 0.25 >= 1.0 ? setZoomLevel(zoomLevel - 0.25) : null;

    const placeholderCompData = { name: "Placeholder Comp", duration: 0, frameRate: 0, width: 0, height: 0, layers: [] };
    const [compData, setCompData] = useState(placeholderCompData);

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

    const updateView = () => {
        fetchCompData()
            .then((data) => setCompData(data))
            .catch((error) => console.error("Error fetching comp data:", error));
    };

    window.addEventListener("focus", updateView);

    return (
        <main>
            <Toolbar
                bpm={bpm} setBpm={setBpm}
                beatsPerBar={beatsPerBar} setBeatsPerBar={setBeatsPerBar}
                zoomLevel={zoomLevel} increaseZoom={increaseZoom} decreaseZoom={decreaseZoom}
                updateView={updateView}
            />
            <Timeline compData={compData} bpm={bpm} beatsPerBar={beatsPerBar} zoomLevel={zoomLevel} />
            <div id="information">
                <hr />
                <p><small>comp duration: {compData.duration} seconds | total beats: {Math.floor(compData.duration * (bpm / 60 * (beatsPerBar / 4)))} | total bars: {Math.ceil((Math.floor(compData.duration * (bpm / 60 * (timeSignature / 4)))) / timeSignature)} | beats per second: { bpm / 60 * (beatsPerBar / 4)}</small></p>
            </div>
        </main>
    );
};

export default App;
