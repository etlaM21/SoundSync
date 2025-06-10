export default class Layer {
    /**
     * Constructs a Layer instance representing a single AE layer on the timeline.
     *
     * @param {Object} layerData - Raw layer data from AE (index, name, color, inPoint, outPoint, duration)
     * @param {number} arrayIndex - Position of the layer in the compData.layers array
     * @param {Object} compData - Composition data (including duration)
     * @param {number} totalBeats - Total beats in the timeline (based on comp duration and bpm)
     * @param {number} beatWidth - Width in pixels per beat (to position in UI)
     * @param {number} timelineWidth - Total width of the timeline in pixels
     */
    constructor(layerData, arrayIndex, compData, totalBeats, beatWidth, timelineWidth) {
      // Unique index from AE to identify this layer
      this.index = layerData.index;
      this.arrayIndex = arrayIndex;
      this.name = layerData.name;
      this.color = layerData.color;
  
      // Timing info in seconds (from AE)
      this.inPoint = layerData.inPoint;
      this.outPoint = layerData.outPoint;
      this.duration = layerData.duration;
  
      this.compDuration = compData.duration; // Total comp duration in seconds
      this.totalBeats = totalBeats;          // Total beats timeline spans
  
      // Calculate grid start (1-based index of beat where layer starts)
      this.gridStart = Math.floor((this.inPoint / this.compDuration) * this.totalBeats) + 1;
      if (this.gridStart < 1) this.gridStart = 1;
  
      // Closest grid start is rounded (for snapping)
      this.closestGridStart = Math.round((this.inPoint / this.compDuration) * this.totalBeats) + 1;
      if (this.closestGridStart < 1) this.closestGridStart = 1;
  
      // Grid end (beat index where layer ends)
      this.gridEnd = Math.ceil((this.outPoint / this.compDuration) * this.totalBeats) + 1;
      if (this.gridEnd > this.totalBeats) this.gridEnd = this.totalBeats;
  
      // Closest grid end rounded for snapping
      this.closestGridEnd = Math.round((this.outPoint / this.compDuration) * this.totalBeats) + 1;
      if (this.closestGridEnd > this.totalBeats) this.closestGridEnd = this.totalBeats;
  
      // Duration in beats (integer number of beats spanned)
      this.gridDuration = this.gridEnd - this.gridStart;
  
      // Scaling factor for rendering:
      // ratio of AE duration in seconds to duration in beats scaled to seconds per beat
      this.scaling = this.duration / (this.gridDuration * (this.compDuration / this.totalBeats));
  
      // Calculate base X position on grid (in pixels) at gridStart beat
      this.baseGridX = (this.gridStart - 1) * beatWidth;
  
      // True X position (in pixels) based on exact inPoint relative to comp duration
      this.trueX = (this.inPoint / this.compDuration) * timelineWidth;
  
      // Translation in pixels to adjust for snapping difference between trueX and baseGridX
      this.translateX = this.trueX - this.baseGridX;
    }

    /**
    * Rescales the layer, calculates the scaling factor new
    * @param {number} beatWidth - Width in pixels per beat (to position in UI)
    * @param {number} timelineWidth - Total width of the timeline in pixels
    */

    rescaleLayer(beatWidth, timelineWidth) { 
      // Duration in beats (integer number of beats spanned)
      this.gridDuration = this.gridEnd - this.gridStart;
  
      // Scaling factor for rendering:
      // ratio of AE duration in seconds to duration in beats scaled to seconds per beat
      this.scaling = this.duration / (this.gridDuration * (this.compDuration / this.totalBeats));
  
      // Calculate base X position on grid (in pixels) at gridStart beat
      this.baseGridX = (this.gridStart - 1) * beatWidth;
  
      // True X position (in pixels) based on exact inPoint relative to comp duration
      this.trueX = (this.inPoint / this.compDuration) * timelineWidth;
  
      // Translation in pixels to adjust for snapping difference between trueX and baseGridX
      this.translateX = this.trueX - this.baseGridX;
    }
  
    /**
     * Moves the layer horizontally on the timeline by a number of beats.
     * Updates all related timing and grid properties.
     *
     * @param {number} beats - Number of beats to move (can be negative)
     * @param {bool} snapping - Whether or not to snap to the grid
     * These are just to rescale Layer properly after moving
     * @param {number} beatWidth - Width in pixels per beat (to position in UI)
     * @param {number} timelineWidth - Total width of the timeline in pixels
     */
    moveLayer(beats, snapping, beatWidth, timelineWidth) {
      console.log("moving", beats, "beats. current in:", this.inPoint, "current gridStart:", this.gridStart, "SNAPPING?", snapping);
  
      // Get current beat duration to keep layer duration when finished moving
      let gridDuration = this.gridEnd - this.gridStart;
      let closestGridDuration = this.closestGridEnd - this.closestGridStart;
      // Update grid positions by adding beats
      this.gridStart += beats;
      this.closestGridStart += beats;
      if (this.closestGridStart < 1) this.closestGridStart = 1;

      if (this.gridStart < 1 || snapping) {
        this.gridStart = 1;
        
        this.gridStart = this.closestGridStart;
        this.gridEnd = this.gridStart + gridDuration;
        this.closestGridEnd = this.closestGridStart + closestGridDuration;
      }
      else  {
        this.gridEnd += beats;
        if (this.gridEnd > this.totalBeats) this.gridEnd = this.totalBeats; 
        this.closestGridEnd += beats;
        if (this.closestGridEnd > this.totalBeats) this.closestGridEnd = this.totalBeats; 
      }
  
  

      // Recalculate timing in seconds based on new grid positions
      this.inPoint = ((this.gridStart - 1) * this.compDuration) / this.totalBeats;
      this.outPoint = ((this.gridEnd - 1) * this.compDuration) / this.totalBeats;
      
      // Handle if layer moved beyond the timeline
      if (this.inPoint < 0) this.inPoint = 0;
      if (this.outPoint > this.compDuration) this.outPoint = this.compDuration;
      // Update duration
      this.duration = this.outPoint - this.inPoint;
      this.rescaleLayer(beatWidth, timelineWidth);
  
      console.log("moved new in:", this.inPoint, "new gridStart:", this.gridStart);
    }
  }
  