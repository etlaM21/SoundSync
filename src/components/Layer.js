export default class Layer {
    constructor(layerData, arrayIndex, compData, totalBeats, beatWidth, timelineWidth) {
        this.index = layerData.index;
        this.arrayIndex = arrayIndex;
        this.name = layerData.name;
        this.color = layerData.color;

        this.inPoint = layerData.inPoint;
        this.outPoint = layerData.outPoint;
        this.duration = layerData.duration;

        this.compDuration = compData.duration;
        this.totalBeats = totalBeats;

        this.gridStart = Math.floor(this.inPoint / this.compDuration * this.totalBeats) + 1;
        this.gridStart < 1 ? this.gridStart = 1 : this.gridStart;
        this.closestGridStart = Math.round(this.inPoint / this.compDuration * this.totalBeats) + 1;
        this.closestGridStart < 1 ? this.closestGridStart = 1 : this.closestGridStart;
        this.gridEnd = Math.ceil(this.outPoint / this.compDuration * this.totalBeats) + 1;
        this.gridEnd > this.totalBeats ? this.gridEnd = this.totalBeats : this.gridEnd;
        this.closestGridEnd = Math.round(this.outPoint / this.compDuration * this.totalBeats) + 1;
        this.closestGridEnd > this.totalBeats ? this.closestGridEnd = this.totalBeats : this.closestGridEnd;
        this.gridDuration = this.gridEnd - this.gridStart;
        this.scaling = this.duration / (this.gridDuration * (this.compDuration / this.totalBeats));

        this.baseGridX = (this.gridStart - 1) * beatWidth;
        this.trueX = (this.inPoint / this.compDuration) * timelineWidth;
        this.translateX = this.trueX - this.baseGridX;
    }

    moveLayer(beats) {
        console.log("moving", beats, "beats. current in:", this.inPoint, "current gridStart: ", this.gridStart);
        this.gridStart += beats;
        this.gridStart < 1 ? this.gridStart = 1 : this.gridStart;
        this.closestGridStart += beats;
        this.closestGridStart < 1 ? this.closestGridStart = 1 : this.closestGridStart;
        this.gridEnd += beats;
        this.gridEnd > this.totalBeats ? this.gridEnd = this.totalBeats : this.gridEnd;
        this.closestGridEnd += beats;
        this.closestGridEnd > this.totalBeats ? this.closestGridEnd = this.totalBeats : this.closestGridEnd;

        this.inPoint = ((this.gridStart - 1) * this.compDuration) / this.totalBeats;
        this.inPoint < 0 ? this.inPoint = 0 : this.inPoint;
        this.outPoint = ((this.gridEnd - 1) * this.compDuration) / this.totalBeats;
        this.outPoint > this.compDuration ? this.outPoint = this.compDuration : this.outPoint;
        this.duration = this.outPoint - this.inPoint;
        console.log("moved new in:", this.inPoint, "new gridstart:", this.gridStart);
    }
}