import React from 'react';
import { useState, useMemo } from 'react';
import './style.scss'

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
    const decreaseZoom = () => {setZoomLevel(zoomLevel - 0.25)};

    const dummyCompData = {
        duration: 43,
        durationMilli: 43 * 1000
    }

    const beatsPerSecond = bpm / 60 * (beatsPerBar / 4);
    const beatsPerSignature = bpm / 60 * (timeSignature / 4);
    const totalBeats = useMemo(() => Math.floor(dummyCompData.duration * beatsPerSecond), [bpm, beatsPerBar]);
    const totalBeatsPerSignature = useMemo(() => Math.floor(dummyCompData.duration * beatsPerSignature), [bpm]);
    const roundedBeats = useMemo(() => Math.ceil(totalBeats / beatsPerBar) * beatsPerBar, [bpm, beatsPerBar]);
    const totalBars = Math.ceil((totalBeatsPerSignature) / timeSignature);

    const dummyLayerData  = [ {
            name: "My Cool Animation",
            inPoint: 5.2,
            outPoint: 15,
            duration: 15 - 5.2
        },
        {
            name: "Some other Animation",
            inPoint: 12,
            outPoint: 36.5,
            duration: 36.5 - 12
        },
        {
            name: "Background",
            inPoint: 0,
            outPoint: 43,
            duration: 43 - 0
        }
    ]

  return (
    <main>
        <div id='settings'>
            <label htmlFor='bpm'>BPM</label><input name='bpm' type='number' size='3' value={bpm} onChange={handleBpmFormChange} />
            <select name='beatsPerBar' id='beatsPerBarSelect' onChange={handleBeatsPerBarFormChange}>
                <option value='2'>2</option>
                <option value='4' selected>4</option>
                <option value='8'>8</option>
                <option value='16'>16</option>
            </select>
            <button onClick={increaseZoom}>zoom in</button>
            <button onClick={decreaseZoom}>zoom out</button>
        </div>
      <hr />
        <div id='timeline'>
            <div className='grid-layers'  style={{gridTemplate: `100% / repeat(${roundedBeats}, 1fr)`, width: `${100 * zoomLevel}%`}}>
                {dummyLayerData.map((layer, index) => {

                    const gridStart = Math.floor(layer.inPoint / dummyCompData.duration * totalBeats) + 1;
                    const gridEnd = Math.floor(layer.outPoint / dummyCompData.duration * totalBeats) + 1;

                    return (
                        <div key={index} className='timeline-layer' style={{ gridColumnStart: gridStart, gridColumnEnd: gridEnd, gridRow: index + 1 }}>
                            {layer.name}
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
                                    console.log("currentTotalBeats", currentTotalBeats);
                                    return(<div key={beatIndex} className='grid-beat' />);
                            }
                            
                        })}
                    </div>
                )
            })}
            </div>
        </div>
        <hr />
        <div id='information'>
            <p><small>comp duration: {dummyCompData.duration} seconds | total beats: {totalBeats} | total bars: {totalBars} | beats per second: {beatsPerSecond}</small></p>
        </div>
    </main>
  );
};

export default App;
