# SoundSync

SoundSync is a After Effects CEP extension helping you align effects and layers to a music.

It brings a BPM timeline to After Effects, enabling you to edit on beat.

## Interface Architecture

### App.jsx

The `App.jsx` file is the main wrapper of the application. It:

- Initializes all global states: BPM, time signature, zoom level, and composition data.
- Loads data from:
  - ExtendScript (in production)
  - Mock data (in development mode via `__IS_DEV__`)
- Registers a `focus` event listener to re-fetch data when the extension regains focus.
- Allows users to export and import comp data as JSON.
- Renders three main components:
  - `Toolbar`: Controls for BPM, zoom, data IO
  - `Timeline`: Displays the grid and layers
  - `Loader`: Displayed during async fetches
- Includes a summary bar displaying derived metrics like total beats, bars, and beats/second.

> 💡 Development mode helps decouple the interface from After Effects during testing.

### Toolbar.jsx

`Toolbar.jsx` provides user controls for the timeline application:

- **Reload Button**: Refreshes composition data from After Effects.
- **BPM Input**: Allows user to adjust the beats per minute.
- **Beats per Bar Dropdown**: Selects time signature numerator (2, 4, 8, or 16).
- **Zoom In/Out Icons**: Controls horizontal zoom level on the timeline.
- **Save/Load JSON Buttons**: Export or import composition data as JSON files.

The component receives all relevant state values and setters as props and triggers updates via event handlers. It uses SVG icons as React components for interactive controls.

### Timeline.jsx

This component renders the interactive timeline grid with layers representing After Effects layers in the composition. 

- Calculates total beats, bars, and beat width based on BPM, beats per bar, and composition duration.
- Renders a grid of bars and beats scaled horizontally by zoom level.
- Creates `Layer` instances for each AE layer to calculate grid placement and styles.
- Implements drag-and-drop horizontal movement of layers:
  - Shows a ghost preview layer while dragging.
  - Updates layer position in local state on mouse release.
  - Synchronizes layer inPoint changes back to After Effects via CEP scripting.
- Tracks mouse position and drag state with React refs.
- Listens globally for mouseup events to end drag even if mouseup occurs outside the timeline.
- Uses CSS Grid for layout and transforms for smooth visual scaling and translation.

This component manages the core timeline visualization and user interactions for adjusting layer timing.

#### Layer.js

This class models a single After Effects layer on the timeline grid.

- Takes AE layer data and calculates:
  - Grid start and end positions (in beats)
  - Closest snapped grid positions (for precise UI snapping)
  - Pixel positions based on beat width and timeline width
  - Scaling for visual rendering based on layer duration vs grid span

- Provides a `moveLayer(beats)` method to shift the layer horizontally by a specified number of beats, updating both:
  - The AE inPoint/outPoint (in seconds)
  - The grid positions (start/end beat indices)

- Maintains synchronization between AE time-based data and the pixel/beat-based UI timeline representation.

## After Effects Scripts

### `duplicateLayerOnBeat(bpm)`

- Duplicates the currently selected layer throughout the active composition.
- Places duplicates spaced according to the beat interval calculated from the given BPM.
- Automatically stops duplicating when the end of the composition is reached.
- Uses an undo group for safe operation within After Effects.

### `getCompData()`

- Gathers detailed information about the active composition and its layers.
- Returns a JSON string with the following info:
  - Composition name, duration, frame rate, width, and height.
  - An array of layers, each containing:
    - Layer index and name.
    - In and out points, and duration.
    - Label color as an RGB triplet.
- Useful for syncing external apps or UI with After Effects composition data.

### `moveLayer(layerIndex, newIn)`

- Moves a layer (by index) to a new start time (`newIn` seconds).
- Wraps the action in an undo group.
- Returns a status string to indicate success or failure.

## Attributions

- Icons by [UXWing](https://uxwing.com/)