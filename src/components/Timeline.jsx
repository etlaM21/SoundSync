import React, { useEffect, useRef, useState, useMemo } from "react";
import Layer from "./Layer";

export default function Timeline({ compData, bpm, beatsPerBar, zoomLevel }) {

    /*
    * SETUP
    */
    const timeSignature = 4;
    const beatsPerSecond = bpm / 60 * (beatsPerBar / 4);
    const beatsPerSignature = bpm / 60 * (timeSignature / 4);
    const totalBeats = useMemo(() => Math.floor(compData.duration * beatsPerSecond), [bpm, compData, beatsPerBar]);
    const totalBeatsPerSignature = useMemo(() => Math.floor(compData.duration * beatsPerSignature), [bpm, compData]);
    const roundedBeats = useMemo(() => Math.ceil(totalBeats / beatsPerBar) * beatsPerBar, [bpm, compData, beatsPerBar]);
    const totalBars = Math.ceil(totalBeatsPerSignature / timeSignature);

    const timelineRef = useRef(null);
    const [timelineWidth, setTimelineWidth] = useState(0);

    useEffect(() => {
        if (timelineRef.current) {
            setTimelineWidth(timelineRef.current.getBoundingClientRect().width);
        }

        const handleResize = () => {
            if (timelineRef.current) {
                setTimelineWidth(timelineRef.current.getBoundingClientRect().width);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const beatWidth = timelineWidth / totalBeats;

    /*
    * CREATE LAYER OBJECTS
    */
     const layers = useMemo(() => {
        return compData.layers.map((layer) => 
            new Layer(layer, compData, totalBeats, beatWidth, timelineWidth)
        );
    }, [compData, totalBeats, beatWidth, timelineWidth]);

    /*
    * INTERACTION
    */

    const [ghostLayer, setGhostLayer] = useState(null);

    const handleMouseDown = (layer, mode = "both") => {
        setGhostLayer(layer);
    }

    const handleMouseUp = () => {
        setGhostLayer(null);
    };

    return (
        <div id="timeline">
            <div className="grid-layers" ref={timelineRef} style={{ gridTemplate: `auto / repeat(${roundedBeats}, 1fr)`, width: `${100 * zoomLevel}%` }}>
            {layers.map((layer, index) => (
                    <div 
                        key={index} 
                        className="timeline-layer" 
                        style={{
                            gridColumnStart: layer.gridStart,
                            gridColumnEnd: layer.gridEnd,
                            gridRow: layer.index,
                            backgroundColor: `rgb(${layer.color[0]}, ${layer.color[1]}, ${layer.color[2]})`,
                            transform: `scaleX(${layer.scaling}) translateX(${layer.translateX}px)`,
                            transformOrigin: "left"
                        }}
                        onMouseDown={() => handleMouseDown(layer)}
                        onMouseUp={() => handleMouseUp()}
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
