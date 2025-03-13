import React from "react";
import IconZoomIn from "../assets/icons/zoom-in-icon.svg";
import IconZoomOut from "../assets/icons/zoom-out-icon.svg";
import IconReload from "../assets/icons/reload-icon.svg";

export default function Toolbar({ bpm, setBpm, beatsPerBar, setBeatsPerBar, zoomLevel, increaseZoom, decreaseZoom, updateView, saveCompDataJSON, loadCompDataJSON }) {
    return (
        <div id="toolbar">
            <menu id="main">
                <IconReload onClick={updateView} />
                <label htmlFor="bpm">BPM</label>
                <input name="bpm" type="number" size="3" style={{ width: "3rem" }} value={bpm} onChange={(e) => setBpm(e.target.value)} />
                <select name="beatsPerBar" id="beatsPerBarSelect" value={beatsPerBar} onChange={(e) => setBeatsPerBar(e.target.value)}>
                    <option value="2">2</option>
                    <option value="4">4</option>
                    <option value="8">8</option>
                    <option value="16">16</option>
                </select>
                <IconZoomIn onClick={increaseZoom} style={{ marginLeft: "1.5px" }} />
                <IconZoomOut onClick={decreaseZoom} />
            </menu>
            <menu id="second">
                <button onClick={() => saveCompDataJSON("soundsync")}>SAVE JSON</button>
                <button onClick={loadCompDataJSON}>LOAD JSON</button>
            </menu>
        </div>
    );
}
