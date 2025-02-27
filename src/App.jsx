import React from 'react';
import { useState, useRef, useMemo } from 'react';
import './style.scss'

const App = () => {

    const [bpm, setBpm] = useState(120);
    const bpmInput = useRef(null);

    const handleBpmFormChange = (e) => {
        setBpm(e.target.value);
    }
    
    const setBpmFromForm = () => {
        setBpm(bpmInput.current.value)
    }

    const dummyCompData = {
        duration: 43,
        durationMilli: 43 * 1000
    }

    const beatsPerSecond = bpm / 60;
    const totalBeats = useMemo(() => Math.floor(dummyCompData.duration * beatsPerSecond), [bpm]);
    const beatsPerBar = 4;
    const totalBars = Math.ceil(totalBeats / beatsPerBar);

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
            <label htmlFor='bpm'>BPM</label><input name='bpm' type='number' size='3' value={bpm} onChange={handleBpmFormChange} ref={bpmInput}/> <button onClick={setBpmFromForm}>set</button>
        </div>
      <hr />
        <div id='timeline'>
            <div className='grid-layers'  style={{gridTemplate: `100% / repeat(${totalBars * beatsPerBar}, 1fr)`}}>
                <div className='timeline-layer'>MyAnimation</div>
                <div className='timeline-layer'>MyAnimation2</div>
            </div>
            <div className='grid-timeline' style={{gridTemplate: `100% / repeat(${totalBars}, 1fr)`}}>
                {Array.from({ length: totalBars }).map((_, barIndex) => (
                    <div key={barIndex} className='grid-bar' style={{gridTemplate: `100% / repeat(${beatsPerBar}, 1fr)`}}>
                        {Array.from({ length: beatsPerBar }).map((_, beatIndex) => (
                            <div key={beatIndex} className='grid-beat' />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    </main>
  );
};

export default App;
