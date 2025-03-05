import React, { useEffect, useRef, useState, useMemo } from "react";

export default function Timeline({ compData, bpm, beatsPerBar, zoomLevel }) {
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

    return (
        <div id="timeline">
            <div className="grid-layers" ref={timelineRef} style={{ gridTemplate: `auto / repeat(${roundedBeats}, 1fr)`, width: `${100 * zoomLevel}%` }}>
                {compData.layers.map((layer, index) => {
                    const gridStart = Math.floor(layer.inPoint / compData.duration * totalBeats) + 1;
                    const gridEnd = Math.ceil(layer.outPoint / compData.duration * totalBeats) + 1;
                    const gridDuration = gridEnd - gridStart;
                    const layerScaling = layer.duration / (gridDuration * (compData.duration / totalBeats));
                    const baseGridX = (gridStart - 1) * beatWidth;
                    const trueX = (layer.inPoint / compData.duration) * timelineWidth;
                    const translateX = trueX - baseGridX;

                    return (
                        <div key={index} className="timeline-layer" style={{
                            gridColumnStart: gridStart,
                            gridColumnEnd: gridEnd,
                            gridRow: index + 1,
                            backgroundColor: `rgb(${layer.color[0]}, ${layer.color[1]}, ${layer.color[2]})`,
                            transform: `scaleX(${layerScaling}) translateX(${translateX}px)`,
                            transformOrigin: "left"
                        }}>
                            <span style={{ display: "inline-block", transform: "scaleX(1)" }}>{layer.name}</span>
                        </div>
                    );
                })}
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
