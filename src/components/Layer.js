export default class Layer {
    constructor(layerData, compData, totalBeats, beatWidth, timelineWidth) {
        this.index = layerData.index;
        this.name = layerData.name;
        this.color = layerData.color;
        this.row = layerData.row;
        this.inPoint = layerData.inPoint;
        this.outPoint = layerData.outPoint;
        this.duration = layerData.duration;

        this.gridStart = Math.floor(this.inPoint / compData.duration * totalBeats) + 1;
        this.gridEnd = Math.ceil(this.outPoint / compData.duration * totalBeats) + 1;
        this.gridDuration = this.gridEnd - this.gridStart;
        this.scaling = this.duration / (this.gridDuration * (compData.duration / totalBeats));

        this.baseGridX = (this.gridStart - 1) * beatWidth;
        this.trueX = (this.inPoint / compData.duration) * timelineWidth;
        this.translateX = this.trueX - this.baseGridX;
    }
}