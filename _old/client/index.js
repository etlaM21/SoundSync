// Initialize CSInterface
const csInterface = new CSInterface();

// Get elements from the DOM
const bpmInput = document.getElementById("bpm-input");
const duplicateButton = document.getElementById("duplicate-btn");

// When the button is clicked, call the AE script with the BPM value
duplicateButton.addEventListener("click", () => {
  const bpm = parseInt(bpmInput.value);
  if (isNaN(bpm)) {
    alert("Please enter a valid BPM!");
    return;
  }

  // Send the BPM to the After Effects host script to handle the duplication
  csInterface.evalScript(`duplicateLayerOnBeat(${bpm})`);
});