import React, { useEffect, useRef, useState, useMemo } from "react";
import Layer from "./Layer";

export default function Timeline({ compData, bpm, beatsPerBar, zoomLevel, updateView, setLoading, setLoadingText }) {

    /*
    * SETUP
    */
    const timeSignature = 4;
    // const beatsPerSecond = useRef(bpm / 60 * (beatsPerBar / 4));
    const beatsPerSecond = useMemo(() => (bpm / 60) * (beatsPerBar / 4), [bpm, beatsPerBar]);

    const beatsPerSignature = bpm / 60 * (timeSignature / 4);
    const totalBeats = useMemo(() => Math.floor(compData.duration * beatsPerSecond), [bpm, compData.duration, beatsPerBar, beatsPerSecond]);
    const totalBeatsPerSignature = useMemo(() => Math.floor(compData.duration * beatsPerSignature), [bpm, compData]);
    const roundedBeats = useMemo(() => Math.ceil(totalBeats / beatsPerBar) * beatsPerBar, [totalBeats, beatsPerBar]);
    const totalBars = Math.ceil(totalBeatsPerSignature / timeSignature);

    const timelineRef = useRef(null); // Reference for the timeline container
    const [timelineWidth, setTimelineWidth] = useState(0); // Store actual width in pixels
    const [beatWidth, setBeatWidth] = useState(0); // State for beatWidth

    // Update timeline width and beatWidth on resize or when compData changes
    useEffect(() => {
        const updateTimelineWidth = () => {
            if (timelineRef.current) {
                setTimelineWidth(timelineRef.current.getBoundingClientRect().width);
            }
        };

        updateTimelineWidth(); // Initially set width
        window.addEventListener('resize', updateTimelineWidth);

        return () => window.removeEventListener('resize', updateTimelineWidth);
    }, [compData, zoomLevel]); // Recalculate on compData or zoomLevel changes

    // Recalculate beatWidth when timelineWidth or totalBeats is updated
    useEffect(() => {
        if (timelineWidth > 0 && totalBeats > 0) {
            setBeatWidth(timelineWidth / totalBeats);
        }
    }, [timelineWidth, totalBeats]);

    
    /*
    * CREATE LAYER OBJECTS
    */
    const [layers, setLayers] = useState([]);

    useEffect(() => {
        const newLayers = compData.layers.map((layer, index) => 
            new Layer(layer, index, compData, totalBeats, beatWidth, timelineWidth)
        );
        setLayers(newLayers);
    }, [compData, totalBeats, beatWidth, timelineWidth])

    
    /*
    * INTERACTION
    */

    const [ghostLayer, setGhostLayer] = useState(null);
    const ghostLayerRef = useRef(null);

    const startMouseX = useRef(0);
    const mouseX = useRef(0);

    const isDragging = useRef(false);
    const draggedLayer = useRef(null);

    const movedBeats = useRef(0);

    useEffect(() => {
        const handleMouseMove = (ev) => {
            if (isDragging.current && beatWidth > 0) {
                mouseX.current = ev.pageX;
                /* console.log(
                    "Current Mouse x = ", startMouseX.current - mouseX.current,
                    "px different from start, that equals ", 
                    Math.abs(startMouseX.current - mouseX.current) / beatWidth,
                    "beats."
                ); */
                movedBeats.current = -Math.round((startMouseX.current - mouseX.current) / beatWidth);
                if (ghostLayerRef.current && movedBeats.current !== 0) {
                    // ghostLayerRef.current.moveLayer(movedBeats);
                     // Directly update the ghost layer's position in the DOM
                    const ghostLayerElement = document.querySelector(".timeline-layer.ghost");
                    if (ghostLayerElement) {
                        const newPosition = movedBeats.current * beatWidth;  // Get the position to move
                        console.log("movedBeats",movedBeats.current,"beatWidth",beatWidth,"newPosition",newPosition);
                        ghostLayerElement.style.transform = `translateX(${newPosition}px)`;
                    }
                    // const updatedLayer = ghostLayerRef.current.moveLayer(movedBeats);
                    // setGhostLayer(updatedLayer); // Update the ghost layer for UI
                }
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [beatWidth]); // Ensure this hook listens for beatWidth changes


    const layerMouseDown = (layer) => {
        console.log("totalBeats", totalBeats, "beatWidth", beatWidth)
        startMouseX.current = mouseX.current;
        isDragging.current = true;
        movedBeats.current = 0;
        draggedLayer.current = layers.find(l => l.index === layer.index);
        const newGhostLayer = new Layer(
            {
                ...draggedLayer.current
            },
            draggedLayer.current.arrayIndex, compData, totalBeats, beatWidth, timelineWidth
        )
        ghostLayerRef.current = newGhostLayer;
        console.log("ghostLayerRef.current", ghostLayerRef.current, "draggedLayer.current", draggedLayer.current)
        setGhostLayer(newGhostLayer);  // Trigger UI update
    };
    
    // Handle Mouse Up
    const layerMouseUp = () => {
        if (isDragging.current && movedBeats.current != 0) {
            isDragging.current = false;
            ghostLayerRef.current = null;
            setGhostLayer(null);
            const beatsToUpdate = movedBeats.current;
            movedBeats.current = 0;
             // Create a new instance instead of modifying the existing one
             setLayers((prevLayers) => {
                return prevLayers.map((layer) => {
                    if (layer === draggedLayer.current) {
                        // Create a new Layer instance and apply the movement
                         /* const updatedLayer = new Layer(
                            { ...layer }, // Clone original layer data
                            layer.arrayIndex, 
                            compData, 
                            totalBeats, 
                            beatWidth, 
                            timelineWidth
                        ); */
                        const updatedLayer = layer;
                        console.log("updatedLayer", updatedLayer)
                        updatedLayer.moveLayer(beatsToUpdate); // Apply movement
                        if(!__IS_DEV__) {
                            setLoadingText(`Moving Layer by ${beatsToUpdate} Beats`);
                            setLoading(true);
                            moveAELayer(updatedLayer.index, updatedLayer.inPoint)
                                .then(() => {updateView(); setLoading(false);})
                                .catch((error) => console.error("Error fetching comp data:", error));
                        }
                        return updatedLayer;
                    }
                    return layer;
                });
            });
            // draggedLayer.current = null; // Clear reference after updating
        }
    };

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

    // Attach onMouseUp globally to capture any mouse release outside the timeline
    useEffect(() => {
        const handleMouseUp = () => {
            layerMouseUp(); 
        };

        document.addEventListener("mouseup", handleMouseUp);

        return () => document.removeEventListener("mouseup", handleMouseUp);
    }, []);


    return (
        <div id="timeline" onMouseMove={(ev) => mouseX.current = ev.pageX}>
            <div className="grid-layers" ref={timelineRef} style={{ gridTemplate: `auto / repeat(${roundedBeats}, 1fr)`, width: `${100 * zoomLevel}%` }}>
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
                        onMouseDown={() => layerMouseDown(layer)}
                        onMouseUp={() => layerMouseUp()}
                    >
                        <span style={{ display: "inline-block", transform: "scaleX(1)" }}>{layer.name}</span>
                    </div>
                ))}
                {
                    ghostLayer &&
                    
                            <div className="timeline-layer ghost" style={{
                                gridColumnStart: ghostLayer.gridStart,
                                gridColumnEnd: ghostLayer.gridEnd,
                                gridRow: ghostLayer.index,
                                outlineColor: `rgb(${ghostLayer.color[0]}, ${ghostLayer.color[1]}, ${ghostLayer.color[2]})`,
                            }}>
                            </div>
                }
            </div>
            <div className="grid-timeline" style={{ gridTemplate: `100% / repeat(${totalBars}, 1fr)`, width: `${100 * zoomLevel}%` }}>
                {Array.from({ length: totalBars }).map((_, barIndex) => (
                    <div key={barIndex} className="grid-bar" style={{ gridTemplate: `100% / repeat(${beatsPerBar}, 1fr)` }}>
                        {Array.from({ length: beatsPerBar }).map((_, beatIndex) => (
                            <div key={beatIndex} className="grid-beat" />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
