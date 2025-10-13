# Learnings

## Full-Stack CEP Extension Logic

- Using CSInterface.js to call my own AE scripts with evalScript() and transfering data
- Configuration of a proper Manifest.xml to load the extension

## Frontend & UI/UX 

- Global state management in App.jsx (BPM, Zoom, Comp Data) and then passed down to child components
- Mouse Drag event handling and different modes of drag depending on the toggled "work mode" button
  - tough part: proper use of React refs when dragging
- Data modeling in Layer.js to hold all the logic needed to transform a layer
- Decisions about user logic and ways of implementating functionality to enable users to properly use the extension to solve their problens
  - button placement, toggling modes, modals, cursor changes and overall UI design

## Robust After Effects Scripting 

- "DOM Manipulation" in After Effects
  - accessing and manipulating composition data, loop through layers and read/write properties
- Blocking After Effects interaction from the extension when its waiting for a current script to execute in After Effects
  - [global `waitingForAE` state](/src/App.jsx#L61) ensures no crashes
- User-friendly scripts using app.beginUndoGroup() to keep CTRL+Z functionality in AE

## Build & Development Workflow 

- Custom Webpack Configuration to properly bundle and move files into dist folder
- Development Mode with random mockup data to speed up feature implementation without the need to always copy and check in After Effects