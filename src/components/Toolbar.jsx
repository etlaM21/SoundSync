import React from "react";

// SVG icons imported as React components
import IconZoomIn from "../assets/icons/zoom-in-icon.svg";
import IconZoomOut from "../assets/icons/zoom-out-icon.svg";
import IconReload from "../assets/icons/reload-icon.svg";
import IconMagnet from "../assets/icons/magnetic-icon.svg";
import IconMove from "../assets/icons/width-icon.svg";
import IconScale from "../assets/icons/divider-split-vertical-icon.svg";

// Functional component receives props controlling timeline and data IO
export default function Toolbar({
  bpm,
  setBpm,
  beatsPerBar,
  setBeatsPerBar,
  zoomLevel,
  increaseZoom,
  decreaseZoom,
  updateView,
  modeSnap,
  setModeSnap,
  mode,
  setMode,
  saveCompDataJSON,
  loadCompDataJSON,
}) {
  return (
    <div id="toolbar">
      {/* Main toolbar controls */}
      <menu id="main">
        {/* Reload icon triggers composition data refresh */}
        <IconReload onClick={updateView} />

        {/* BPM input: number field bound to bpm state */}
        <label htmlFor="bpm">BPM</label>
        <input
          name="bpm"
          type="number"
          size="3"
          style={{ width: "3rem" }}
          value={bpm}
          // Update parent bpm state on change
          onChange={(e) => setBpm(e.target.value)}
        />

        {/* Beats per bar selector */}
        <select
          name="beatsPerBar"
          id="beatsPerBarSelect"
          value={beatsPerBar}
          // Update parent beatsPerBar state on change
          onChange={(e) => setBeatsPerBar(e.target.value)}
        >
          {/* Common time signature options */}
          <option value="2">2</option>
          <option value="4">4</option>
          <option value="8">8</option>
          <option value="16">16</option>
        </select>

        {/* Zoom controls */}
        <IconZoomIn
          onClick={increaseZoom}
          style={{ marginLeft: "1.5px" }}
        />
        <IconZoomOut 
          onClick={decreaseZoom} 
          style={{ marginLeft: "0" }}
        />
        <div style={{
          display: "inline",
          height: "100%",
          borderLeft: "solid 3px var(--light-grey)",
          marginLeft: "1.5px",
          marginRight: "6px"
        }} />
        {/* Mode Controls controls */}
        <IconMagnet
          onClick={() => setModeSnap(!modeSnap)}
          className={`${modeSnap ? "active" : ""}`}
          style={{ marginLeft: "0" }}
        />
        <IconMove 
          onClick={() => setMode("move")} 
          className={`${mode === "move" ? "active" : ""}`}
          style={{ marginLeft: "0" }}
        />
        <IconScale 
          onClick={() => setMode("scale")} 
          className={`${mode === "scale" ? "active" : ""}`}
          style={{ marginLeft: "0" }}
        />
      </menu>

      {/* Secondary menu with JSON save/load buttons */}
      <menu id="second">
        <button onClick={() => saveCompDataJSON("soundsync")}>SAVE JSON</button>
        <button onClick={loadCompDataJSON}>LOAD JSON</button>
      </menu>
    </div>
  );
}
