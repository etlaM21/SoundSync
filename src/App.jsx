import React from 'react';
import { useState, useMemo, useRef, useEffect } from 'react';
import './style.scss';

import IconReload from './assets/icons/reload-icon.svg';
import IconZoomIn from './assets/icons/zoom-in-icon.svg';
import IconZoomOut from './assets/icons/zoom-out-icon.svg';

const App = () => {

    const [bpm, setBpm] = useState(120.0);

    const handleBpmFormChange = (e) => {
        setBpm(e.target.value);
    }
    
    const [beatsPerBar, setBeatsPerBar] = useState(4);

    const handleBeatsPerBarFormChange = (e) => {
        setBeatsPerBar(e.target.value);
    }

    const timeSignature = 4;

    const [zoomLevel, setZoomLevel] = useState(1.0);

    const increaseZoom = () => {setZoomLevel(zoomLevel + 0.25)};
    const decreaseZoom = () => {zoomLevel - 0.25 >= 1.0 ? setZoomLevel(zoomLevel - 0.25) : null};

    const dummyCompData = {
        duration: 43,
        durationMilli: 43 * 1000
    }

    var placeholderCompData = {
        name: "Placeholder Comp",
        duration: 0,
        frameRate: 0,
        width: 0,
        height: 0,
        layers: []
    };

    const [compData, setCompData] = useState(placeholderCompData);

    const fetchCompData = async () => {
        return new Promise((resolve, reject) => {
            if (!window.CSInterface) {
                reject("CSInterface is not available. Make sure CSInterface.js is loaded.");
                return;
            }
    
            const csInterface = new window.CSInterface();
            csInterface.evalScript("getCompData()", (result) => {
                console.log("Raw ExtendScript Response:", result); // Debugging
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
            .then((data) => {
                setCompData(data);
            })
            .catch((error) => console.error("Error fetching comp data:", error));
    }

    window.addEventListener("focus", updateView);

    const beatsPerSecond = bpm / 60 * (beatsPerBar / 4);
    const beatsPerSignature = bpm / 60 * (timeSignature / 4);
    const totalBeats = useMemo(() => Math.floor(compData.duration * beatsPerSecond), [bpm, compData, beatsPerBar]);
    const totalBeatsPerSignature = useMemo(() => Math.floor(compData.duration * beatsPerSignature), [bpm, compData]);
    const roundedBeats = useMemo(() => Math.ceil(totalBeats / beatsPerBar) * beatsPerBar, [bpm, compData, beatsPerBar]);
    const totalBars = Math.ceil((totalBeatsPerSignature) / timeSignature);


    const timelineRef = useRef(null); // Reference for the timeline container
    const [timelineWidth, setTimelineWidth] = useState(0); // Store actual width in pixels

    useEffect(() => {
        if (timelineRef.current) {
            setTimelineWidth(timelineRef.current.getBoundingClientRect().width);
        }

        // Optional: Update width on window resize
        const handleResize = () => {
            if (timelineRef.current) {
                setTimelineWidth(timelineRef.current.getBoundingClientRect().width);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const beatWidth = timelineWidth / totalBeats; // Now we have the actual pixel width per beat!


  return (
    <main>
        <div id='settings'>
            <IconReload onClick={updateView} />
            <label htmlFor='bpm'>BPM</label><input name='bpm' type='number' size='3' style={{width: '3rem'}} value={bpm} onChange={handleBpmFormChange} />
            <select name='beatsPerBar' id='beatsPerBarSelect' onChange={handleBeatsPerBarFormChange}>
                <option value='2'>2</option>
                <option value='4' selected>4</option>
                <option value='8'>8</option>
                <option value='16'>16</option>
            </select>
            <IconZoomIn onClick={increaseZoom} style={{marginLeft: '1.5px'}}/>
            <IconZoomOut onClick={decreaseZoom} />
            <hr />
        </div>
        <div id='timeline'>
            <div className='grid-layers' ref={timelineRef} style={{gridTemplate: `auto / repeat(${roundedBeats}, 1fr)`, width: `${100 * zoomLevel}%`}}>
                {compData.layers.map((layer, index) => {

                    const gridStart = Math.floor(layer.inPoint / compData.duration * totalBeats) + 1;
                    const gridEnd = Math.ceil(layer.outPoint / compData.duration * totalBeats) + 1;
                    const gridDuration = gridEnd - gridStart;

                    const layerScaling = layer.duration / (gridDuration * (compData.duration / totalBeats));

                    const baseGridX = (gridStart - 1) * beatWidth; 
                    const trueX = (layer.inPoint / compData.duration) * timelineWidth;

                    const translateX = trueX - baseGridX;

                    return (
                        <div key={index} className='timeline-layer' style={{ 
                            gridColumnStart: gridStart,
                            gridColumnEnd: gridEnd,
                            gridRow: index + 1,
                            backgroundColor: `rgb(${layer.color[0]}, ${layer.color[1]}, ${layer.color[2]})`,
                            transform: `scaleX(${layerScaling}) translateX(calc(${trueX}px - ${baseGridX}px)`,
                            transformOrigin: "left"
                            }}>
                            <span style={{ display: "inline-block", transform: "scaleX(1)" }}>
                                {layer.name}
                            </span>
                        </div>
                    );
                })}
            </div>
            <div className='grid-timeline' style={{gridTemplate: `100% / repeat(${totalBars}, 1fr)`, width: `${100 * zoomLevel}%`}}>
                {Array.from({ length: totalBars }).map((_, barIndex) => {
                    return (
                    <div key={barIndex} className='grid-bar' style={{gridTemplate: `100% / repeat(${beatsPerBar}, 1fr)`}}>
                        {Array.from({ length: beatsPerBar }).map((_, beatIndex) => {

                            const currentTotalBeats= ((barIndex ) * beatsPerBar) + (beatIndex + 1);

                            if(currentTotalBeats <= totalBeats) {
                                    return(<div key={beatIndex} className='grid-beat' />);
                            }
                            
                        })}
                    </div>
                )
            })}
            </div>
        </div>
        <div id='information'>
            <hr />
            <p><small>comp duration: {compData.duration} seconds | total beats: {totalBeats} | total bars: {totalBars} | beats per second: {beatsPerSecond}</small></p>
        </div>
    </main>
  );
};

export default App;
