import React, { useState, useMemo, useRef, useEffect } from "react";
import "./style.scss";
import Toolbar from "./components/Toolbar";
import Timeline from "./components/Timeline";
import Loader from "./components/Loader";

const App = () => {

    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("");

    const [bpm, setBpm] = useState(120.0);
    const [beatsPerBar, setBeatsPerBar] = useState(4);
    const [zoomLevel, setZoomLevel] = useState(1.0);
    const timeSignature = 4;
    const increaseZoom = () => setZoomLevel(zoomLevel + 0.25);
    const decreaseZoom = () => zoomLevel - 0.25 >= 1.0 ? setZoomLevel(zoomLevel - 0.25) : null;

    let placeholderCompData = { name: "Placeholder Comp", duration: 0, frameRate: 0, width: 0, height: 0, layers: [] };
    if (__IS_DEV__) {
        placeholderCompData = { name: "Dummy Comp", duration: 48, frameRate: 30, width: 1080, height: 1080, 
            layers: [
                { index: 1, name: "Layer 01", inPoint: 12, outPoint: 35, duration: 35-12, color: [Math.random()*255, Math.random()*255, Math.random()*255] },
                { index: 2, name: "Layer 02", inPoint: 5, outPoint: 21, duration: 21-5, color: [Math.random()*255, Math.random()*255, Math.random()*255] },
                { index: 3, name: "Layer 03", inPoint: 7.8, outPoint: 46, duration: 46-7.8, color: [Math.random()*255, Math.random()*255, Math.random()*255] },
                { index: 4, name: "Layer 04", inPoint: 1, outPoint: 3, duration: 3-1, color: [Math.random()*255, Math.random()*255, Math.random()*255] },
                { index: 5, name: "Layer 05", inPoint: 35, outPoint: 48, duration: 48-35, color: [Math.random()*255, Math.random()*255, Math.random()*255] }
            ] };
    }
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
        if (!__IS_DEV__) {
            setLoadingText("Fetching Compposition Data");
            setLoading(true);
            fetchCompData()
                .then((data) => {setCompData(data); setLoading(false)})
                .catch((error) => console.error("Error fetching comp data:", error));
        }
    };

    window.addEventListener("focus", updateView);

    return (
        <main>
             {
                    loading &&
                        <Loader text={loadingText} />
                }
            <Toolbar
                bpm={bpm} setBpm={setBpm}
                beatsPerBar={beatsPerBar} setBeatsPerBar={setBeatsPerBar}
                zoomLevel={zoomLevel} increaseZoom={increaseZoom} decreaseZoom={decreaseZoom}
                updateView={updateView}
            />
            <Timeline compData={compData} bpm={bpm} beatsPerBar={beatsPerBar} zoomLevel={zoomLevel} updateView={updateView} setLoading={setLoading} setLoadingText={setLoadingText}/>
            <div id="information">
                <hr />
                <p><small>comp duration: {compData.duration} seconds | total beats: {Math.floor(compData.duration * (bpm / 60 * (beatsPerBar / 4)))} | total bars: {Math.ceil((Math.floor(compData.duration * (bpm / 60 * (timeSignature / 4)))) / timeSignature)} | beats per second: { bpm / 60 * (beatsPerBar / 4)}</small></p>
            </div>
        </main>
    );
};

export default App;
