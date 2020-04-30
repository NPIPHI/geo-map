import { GPUMemoryObject, GPUMemoryPointer } from "./memory";
import { featureConstructor } from "./bufferConstructor"

export class Feature {
    outline: GPUMemoryObject | GPUMemoryPointer;
    polygon: GPUMemoryObject | GPUMemoryPointer;
    boundingBox: boundingBox;
    constructor(strip: Float32Array, outline:  GPUMemoryObject | GPUMemoryPointer, polygon:  GPUMemoryObject | GPUMemoryPointer){
        this.boundingBox = new boundingBox(strip);
        this.outline = outline;
        this.polygon = polygon;
    }
    fromPointStrip(strip: Float32Array){
        this.outline = featureConstructor.outlineBuffer(strip);
        this.polygon = featureConstructor.polygonBuffer(strip);
    }
}

class boundingBox{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    constructor(points: Float32Array){
        this.x1 = this.x2 = points[0];
        this.y1 = this.y2 = points[1];
        for(let i = 0; i < points.length; i+=2){
            this.x1 = Math.min(this.x1, points[i])
            this.x2 = Math.max(this.x2, points[i])
            this.y1 = Math.min(this.y1, points[i+1])
            this.y2 = Math.max(this.y2, points[i+1])

        }
    }
    contains(x: number, y: number): boolean{
        return true;
        // return x > this.x1 && x < this.x2 && y > this.y1 && y < this.y2;
    }
}