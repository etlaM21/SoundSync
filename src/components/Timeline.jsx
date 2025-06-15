import React, { useEffect, useRef, useState, useMemo } from "react";
import Layer from "./Layer";

/**
 * Timeline component renders the timeline grid with layers and allows
 * dragging layers horizontally to change their inPoints.
 * 
 * Props:
 * - compData: Composition data with layers and duration
 * - bpm: Beats per minute
 * - beatsPerBar: Number of beats in each bar (time signature numerator)
 * - zoomLevel: Horizontal zoom factor (percentage)
 * - updateView: Callback to refresh composition data from AE
 * - setLoading, setLoadingText: Controls loading UI state for async ops
 */
export default function Timeline({
    compData,
    bpm,
    beatsPerBar,
    zoomLevel,
    updateView,
    setLoading,
    setLoadingText,
    modeSnapRef,
    modeRef
    }) {

    /*
     * SETUP: Calculate timing metrics for timeline grid
     */

    const timeSignature = 4; // Fixed inner time signature (e.g. 4/4)
    
    // Calculate beats per second: bpm / 60 * (beatsPerBar / 4)
    // Memoize so recalculation only occurs when bpm or beatsPerBar change
    const beatsPerSecond = useMemo(() => (bpm / 60) * (beatsPerBar / 4), [bpm, beatsPerBar]);

    // Beats per second for the fixed time signature (used for bar calculations)
    const beatsPerSignature = bpm / 60 * (timeSignature / 4);

    // Total number of beats in composition (floor to integer)
    const totalBeats = useMemo(() => Math.floor(compData.duration * beatsPerSecond), [bpm, compData.duration, beatsPerBar, beatsPerSecond]);

    // Total beats in the fixed time signature scale (floor integer)
    const totalBeatsPerSignature = useMemo(() => Math.floor(compData.duration * beatsPerSignature), [bpm, compData]);

    // Rounded up total beats to the next full bar
    const roundedBeats = useMemo(() => Math.ceil(totalBeats / beatsPerBar) * beatsPerBar, [totalBeats, beatsPerBar]);

    // Total number of bars based on fixed time signature
    const totalBars = Math.ceil(totalBeatsPerSignature / timeSignature);

    // Refs and state to manage dimensions
    const timelineRef = useRef(null);
    const [timelineWidth, setTimelineWidth] = useState(0);
    const [beatWidth, setBeatWidth] = useState(0);

    // Update timeline width on mount, window resize, or compData/zoomLevel change
    useEffect(() => {
        const updateTimelineWidth = () => {
            if (timelineRef.current) {
                setTimelineWidth(timelineRef.current.getBoundingClientRect().width);
            }
        };

        updateTimelineWidth(); // Initial width setup
        window.addEventListener('resize', updateTimelineWidth);

        return () => window.removeEventListener('resize', updateTimelineWidth);
    }, [compData, zoomLevel]);

    // Calculate the width in pixels per beat after timelineWidth or totalBeats change
    useEffect(() => {
        if (timelineWidth > 0 && totalBeats > 0) {
            setBeatWidth(timelineWidth / totalBeats);
        }
    }, [timelineWidth, totalBeats]);


    /*
     * CREATE LAYER OBJECTS
     */
    // Store Layer instances in state for rendering and interaction
    const [layers, setLayers] = useState([]);

    // Create Layer instances whenever compData, totalBeats, beatWidth, or timelineWidth changes
    useEffect(() => {
        const newLayers = compData.layers.map((layer, index) => 
            new Layer(layer, index, compData, totalBeats, beatWidth, timelineWidth)
        );
        setLayers(newLayers);
    }, [compData, totalBeats, beatWidth, timelineWidth]);


    /*
     * INTERACTION: Drag and drop to move layers horizontally (in beats)
     */
    const [ghostLayer, setGhostLayer] = useState(null);  // Visual drag preview
    const ghostLayerRef = useRef(null);

    // Track mouse positions and drag state
    const startMouseX = useRef(0);
    const mouseX = useRef(0);

    const isDragging = useRef(false);
    const draggedLayer = useRef(null);
    const draggeDirection = useRef("");

    const movedBeats = useRef(0);

    // Mouse move handler to update ghost layer during drag
    useEffect(() => {
        const handleMouseMove = (ev) => {
            if (isDragging.current && beatWidth > 0) {
                mouseX.current = ev.pageX;
                movedBeats.current = -Math.round((startMouseX.current - mouseX.current) / beatWidth);
                if (ghostLayerRef.current && movedBeats.current !== 0) {
                    // Create a new ghost layer instance simulating movement
                    const ghost = new Layer(
                        {
                            ...draggedLayer.current
                        },
                        draggedLayer.current.arrayIndex,
                        compData,
                        totalBeats,
                        beatWidth,
                        timelineWidth
                    );
                    if(modeRef.current === "move") ghost.moveLayer(movedBeats.current, modeSnapRef.current, beatWidth, timelineWidth); // simulate movement
                    else if(modeRef.current === "scale") ghost.scaleLayer(draggeDirection.current, movedBeats.current, modeSnapRef.current, beatWidth, timelineWidth); // simulate scaling                    
                    ghostLayerRef.current = ghost;
                    setGhostLayer(ghost);
                }
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [beatWidth]);

    // Start dragging a layer on mouse down
    const layerMouseDown = (layer, direction) => {
        draggeDirection.current = direction;
        console.log("direction", draggeDirection.current);
        startMouseX.current = mouseX.current;
        isDragging.current = true;
        movedBeats.current = 0;
        // Find the corresponding Layer instance
        draggedLayer.current = layers.find(l => l.index === layer.index);
        // Create ghost layer to follow mouse
        const newGhostLayer = new Layer(
            {
                ...draggedLayer.current
            },
            draggedLayer.current.arrayIndex, compData, totalBeats, beatWidth, timelineWidth
        );
        ghostLayerRef.current = newGhostLayer;
        setGhostLayer(newGhostLayer);  // Trigger re-render for ghost layer
    };
    
    // On mouse up, apply the movement if any
    const layerMouseUp = () => {
        if (isDragging.current && movedBeats.current !== 0) {
            isDragging.current = false;
            ghostLayerRef.current = null;
            setGhostLayer(null);
            const beatsToUpdate = movedBeats.current;
            movedBeats.current = 0;
            const dragDirection = draggeDirection.current;
            draggeDirection.current = "";

            // Update the layers state by moving the dragged layer
            setLayers((prevLayers) => {
                return prevLayers.map((layer) => {
                    if (layer === draggedLayer.current && modeRef.current === "move") {
                        // Move the layer's inPoint by beatsToUpdate
                        const updatedLayer = layer;
                        updatedLayer.moveLayer(beatsToUpdate, modeSnapRef.current, beatWidth, timelineWidth);

                        // Sync with After Effects if not in dev mode
                        if(!__IS_DEV__) {
                            setLoadingText(`Moving Layer by ${beatsToUpdate} Beats`);
                            setLoading(true);
                            moveAELayer(updatedLayer.index, updatedLayer.inPoint)
                                .then(() => { updateView(); setLoading(false); })
                                .catch((error) => console.error("Error moving AE layer:", error));
                        }
                        return updatedLayer;
                    }
                    if (layer === draggedLayer.current && modeRef.current === "scale") {
                        // Move the layer's inPoint by beatsToUpdate
                        const updatedLayer = layer;
                        updatedLayer.scaleLayer(dragDirection, beatsToUpdate, modeSnapRef.current, beatWidth, timelineWidth);

                        // Sync with After Effects if not in dev mode
                        if(!__IS_DEV__) {
                            setLoadingText(`Scaling Layer by ${beatsToUpdate} Beats`);
                            setLoading(true);
                            scaleAELayer(updatedLayer.index, updatedLayer.inPoint, updatedLayer.outPoint)
                                .then(() => { updateView(); setLoading(false); })
                                .catch((error) => console.error("Error moving AE layer:", error));
                        }
                        return updatedLayer;
                    }
                    return layer;
                });
            });
        }
    };

    // Calls After Effects script to move a layer by new inPoint
    const moveAELayer = async (layerIndex, newIn) => {
        return new Promise((resolve, reject) => {
            if (!window.CSInterface) {
                reject("CSInterface is not available. Make sure CSInterface.js is loaded.");
                return;
            }
    
            const csInterface = new window.CSInterface();
            csInterface.evalScript(`moveLayer(${layerIndex}, ${newIn})`, (result) => {
                if (result === "success") {
                    resolve();
                } else {
                    reject(result);
                }
            });
        });
    };

    // Global mouseup listener to catch mouse release outside timeline bounds
    useEffect(() => {
        const handleMouseUp = () => {
            layerMouseUp();
        };

        document.addEventListener("mouseup", handleMouseUp);

        return () => document.removeEventListener("mouseup", handleMouseUp);
    }, []);


    /*
     * RENDER
     */
    return (
        <div id="timeline" onMouseMove={(ev) => mouseX.current = ev.pageX}>
            {/* Layer grid: Each layer is positioned and sized based on its timing */}
            <div
                className="grid-layers"
                ref={timelineRef}
                style={{
                    gridTemplate: `auto / repeat(${roundedBeats}, minmax(0, 1fr))`,
                    width: `${100 * zoomLevel}%`
                }}
            >
                {layers.map((layer, index) => (
                    <div 
                        key={index} 
                        className="timeline-layer" 
                        style={{
                            gridColumnStart: layer.closestGridStart,
                            gridColumnEnd: layer.closestGridEnd,
                            gridRow: layer.index,
                            backgroundColor: `rgb(${layer.color[0]}, ${layer.color[1]}, ${layer.color[2]})`,
                            transform: `scaleX(${layer.scaling}) translateX(${layer.translateX}px)`,
                            transformOrigin: "left"
                        }}
                    >
                        <div className="timeline-layer-button left"
                        onMouseDown={() => layerMouseDown(layer, "in")}
                        onMouseUp={() => layerMouseUp()}
                        >&nbsp;</div>
                        <div className="timeline-layer-button right"
                        onMouseDown={() => layerMouseDown(layer, "out")}
                        onMouseUp={() => layerMouseUp()}
                        >&nbsp;</div>
                        <span style={{ display: "inline-block", transform: "scaleX(1)" }}>
                            {layer.name}
                        </span>
                    </div>
                ))}

                {/* Render ghost layer during drag */}
                {ghostLayer && (
                    <div
                        className="timeline-layer ghost"
                        style={{
                            gridColumnStart: ghostLayer.closestGridStart,
                            gridColumnEnd: ghostLayer.closestGridEnd,
                            gridRow: ghostLayer.index,
                            outlineColor: `rgb(${ghostLayer.color[0]}, ${ghostLayer.color[1]}, ${ghostLayer.color[2]})`,
                            transform: `scaleX(${ghostLayer.scaling}) translateX(${ghostLayer.translateX}px)`,
                            transformOrigin: "left",
                        }}
                    />
                )}
            </div>

            {/* Timeline grid showing bars and beats */}
            <div
                className="grid-timeline"
                style={{
                    gridTemplate: `100% / repeat(${totalBars}, minmax(0, 1fr))`,
                    width: `${100 * zoomLevel}%`
                }}
            >
                {/* Bars */}
                {Array.from({ length: totalBars }).map((_, barIndex) => (
                    <div
                        key={barIndex}
                        className="grid-bar"
                        style={{ gridTemplate: `100% / repeat(${beatsPerBar}, minmax(0, 1fr))` }}
                    >
                        {/* Beats inside bar */}
                        {Array.from({ length: beatsPerBar }).map((_, beatIndex) => (
                            <div key={beatIndex} className="grid-beat" />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
