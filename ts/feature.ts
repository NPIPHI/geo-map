import { GPUMemoryObject, GPUMemoryPointer } from "./memory";
import { bufferConstructor } from "./bufferConstructor"
import { boundingBox, spatialElement } from "./kdTree"

export class Feature implements spatialElement{
    id: string;
    outline: GPUMemoryObject | GPUMemoryPointer;
    polygon: GPUMemoryObject | GPUMemoryPointer;
    bBox: boundingBox;
    shape: Float64Array;
    constructor(strip: Float64Array, id: string, outline:  GPUMemoryObject | GPUMemoryPointer, polygon:  GPUMemoryObject | GPUMemoryPointer){
        this.id = id;
        this.bBox = boundingBox.fromStrip(strip);
        this.outline = outline;
        this.polygon = polygon;
        this.shape = strip;
    }
    static fromPointStrip(strip: Float64Array, id: string, constructor: bufferConstructor): Feature{
        return new Feature(strip, id, constructor.featureOutlineBuffer(strip), constructor.featurePolygonBuffer(strip));
    }
}