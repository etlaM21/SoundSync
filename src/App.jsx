import React from 'react';
import './style.css'

const App = () => {
  return (
    <main>
        <div id='settings'>
            <label for='bpm'>BPM</label><input name='bpm' type='number' size='3' /> <button>set</button>
        </div>
      <hr />
        <div id='timeline'>
            <div className='grid-layers'>
                <div className='timeline-layer'>MyAnimation</div>
                <div className='timeline-layer'>MyAnimation2</div>
            </div>
            <div className='grid-bar'>
                <div className='grid-beat'>
                    <div className='grid-beat-fill' />
                    <div className='grid-beat-fill' />
                    <div className='grid-beat-fill' />
                    <div className='grid-beat-fill' />
                </div>
                <div className='grid-beat'>
                    <div className='grid-beat-fill' />
                    <div className='grid-beat-fill' />
                    <div className='grid-beat-fill' />
                    <div className='grid-beat-fill' />
                </div>
                <div className='grid-beat'>
                    <div className='grid-beat-fill' />
                    <div className='grid-beat-fill' />
                    <div className='grid-beat-fill' />
                    <div className='grid-beat-fill' />
                </div>
            </div>
        </div>
    </main>
  );
};

export default App;
