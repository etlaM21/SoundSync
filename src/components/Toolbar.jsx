import React, { useState } from "react";
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';

// SVG icons imported as React components
import IconReload from "../assets/icons/reload-icon.svg";
import IconFilter from "../assets/icons/filter-filtering-icon.svg";
import IconZoomIn from "../assets/icons/zoom-in-icon.svg";
import IconZoomOut from "../assets/icons/zoom-out-icon.svg";
import IconMagnet from "../assets/icons/magnetic-icon.svg";
import IconMove from "../assets/icons/move-icon.svg";
import IconScale from "../assets/icons/scale-icon.svg";
import IconSelect from "../assets/icons/pointer-arrow-icon.svg";
import IconDuplicate from "../assets/icons/stack-icon.svg";

// Functional component receives props controlling timeline and data IO
export default function Toolbar({
  bpm,
  setBpm,
  beatsPerBar,
  setBeatsPerBar,
  zoomLevel,
  increaseZoom,
  decreaseZoom,
  showInactive,
  setShowInactive,
  showHidden,
  setShowHidden,
  updateView,
  modeSnap,
  setModeSnap,
  mode,
  setMode,
  actionDuplicateCount,
  setActionDuplicateCount,
  actionDuplicateMode,
  setActionDuplicateMode,
  duplicateLayer,
  saveCompDataJSON,
  loadCompDataJSON,
}) {

  const [filterDropDownVisibility, setFilterDropDownVisibility] = useState(false);
  const toggleFilterDropDownVisibility = () => setFilterDropDownVisibility(!filterDropDownVisibility);

  const [actioDuplicateDropDownVisibility, setActioDuplicateDropDownVisibility] = useState(false);
  const toggleActioDuplicateDropDownVisibility = () => setActioDuplicateDropDownVisibility(!actioDuplicateDropDownVisibility);

  return (
    <div id="toolbar">
      {/* Main toolbar controls */}
      <menu id="main">
        {/* Reload icon triggers composition data refresh */}
        <Tooltip title="Refresh View" >
          <IconReload onClick={updateView} />
        </Tooltip>
        {/* Filter icon triggers dropdown to filter view */}
        <Tooltip title="Filter View" >
          <IconFilter onClick={toggleFilterDropDownVisibility} className={`${(!showInactive || !showHidden) ? "active" : ""}`}/>
        </Tooltip>
          {filterDropDownVisibility && (
              <div className={"toggled-dropdown"}>
                <ul>
                  <li onClick={() => {setShowInactive(!showInactive); toggleFilterDropDownVisibility()}} className={`${showInactive  ? "" : "active"}`}>Hide invisible / inaudible layers</li>
                  <li onClick={() => {setShowHidden(!showHidden); toggleFilterDropDownVisibility()}} className={`${showHidden  ? "" : "active"}`}>Hide hidden layers</li>
                </ul>
              </div>
            )
          }
        {/* BPM input: number field bound to bpm state */}
        <label htmlFor="bpm">BPM</label>
        <Tooltip title="Beats per Minute" >
          <input
            name="bpm"
            type="number"
            size="3"
            style={{ width: "3rem" }}
            value={bpm}
            // Update parent bpm state on change
            onChange={(e) => setBpm(e.target.value)}
          />
        </Tooltip>

        {/* Beats per bar selector */}
        <Tooltip title="Beats per Bar (in View)" >
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
        </Tooltip>

        {/* Zoom controls */}
        <Tooltip title="Zoom In" >
          <IconZoomIn
            onClick={increaseZoom}
            style={{ marginLeft: "1.5px" }}
          />
        </Tooltip>
        <Tooltip title="Zoom Out" >
          <IconZoomOut 
            onClick={decreaseZoom} 
            style={{ marginLeft: "0" }}
          />
        </Tooltip>
        {/* Mode controls */}
        <Tooltip title="Select Layer" >
          <IconSelect 
            onClick={() => setMode("select")} 
            className={`${mode === "select" ? "active" : ""}`}
            style={{ marginLeft: "0" }}
          />
        </Tooltip>
        <div style={{
          display: "inline",
          height: "100%",
          borderLeft: "solid 3px var(--light-grey)",
          marginLeft: "1.5px",
          marginRight: "6px"
        }} />
        <Tooltip title="Snap Layer to Beats when changing" >
          <IconMagnet
            onClick={() => setModeSnap(!modeSnap)}
            className={`${modeSnap ? "active" : ""}`}
            style={{ marginLeft: "0" }}
          />
        </Tooltip>
        <Tooltip title="Move Layer by beat" >
          <IconMove 
            onClick={() => setMode("move")} 
            className={`${mode === "move" ? "active" : ""}`}
            style={{ marginLeft: "0" }}
          />
        </Tooltip>
        <Tooltip title="Scale Layer by beat" >
          <IconScale 
            onClick={() => setMode("scale")} 
            className={`${mode === "scale" ? "active" : ""}`}
            style={{ marginLeft: "0" }}
          />
        </Tooltip>
        <div style={{
          display: "inline",
          height: "100%",
          borderLeft: "solid 3px var(--light-grey)",
          marginLeft: "1.5px",
          marginRight: "6px"
        }} />
        {/* Actions on layer */}
        <Tooltip title="Repeat Layer on beat" >
          <IconDuplicate 
            onClick={toggleActioDuplicateDropDownVisibility} 
            className={"action"}
            style={{ marginLeft: "0" }}
          />
        </Tooltip>
        <Dialog
          open={actioDuplicateDropDownVisibility}
          onClose={toggleActioDuplicateDropDownVisibility}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
           <p style={{margin: "0"}}>
              <label htmlFor="duplicateCount">Repeat Layer for</label>
                <input
                  name="duplicateCount"
                  type="number"
                  size="4"
                  style={{ width: "3rem" }}
                  value={actionDuplicateCount}
                  onChange={(e) => setActionDuplicateCount(e.target.value)}
                />
                <select
                  name="duplicateMode"
                  value={actionDuplicateMode}
                  onChange={(e) => setActionDuplicateMode(e.target.value)}
                >
                  <option value="beat">beats</option>
                  <option value="bar">bars</option>
                </select>
                <button onClick={() => {duplicateLayer(); toggleActioDuplicateDropDownVisibility();}}>GO!</button>
              </p>
        </Dialog>
        { /*actioDuplicateDropDownVisibility && (
            <div className={"toggled-dropdown"}>
              <p>
                <label htmlFor="duplicateCount">Repeat Layer for</label>
                  <input
                    name="duplicateCount"
                    type="number"
                    size="4"
                    style={{ width: "3rem" }}
                    value={actionDuplicateCount}
                    onChange={(e) => setActionDuplicateCount(e.target.value)}
                  />
                  <select
                    name="duplicateMode"
                    value={actionDuplicateMode}
                    onChange={(e) => setActionDuplicateMode(e.target.value)}
                  >
                    <option value="beat">beats</option>
                    <option value="bar">bars</option>
                  </select>
                  <button onClick={duplicateLayer}>GO!</button>
              </p>
            </div>
          )
        */}
      </menu>

      {/* Secondary menu with JSON save/load buttons */}
      <menu id="second">
        <button onClick={() => saveCompDataJSON("soundsync")}>SAVE JSON</button>
        <button onClick={loadCompDataJSON}>LOAD JSON</button>
      </menu>
    </div>
  );
}
