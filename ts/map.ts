import { feature } from "./feature";
import { GPUBufferSet } from "./memory";
import { bufferConstructor } from "./bufferConstructor"

export class geoMap{
    features: feature[];
    lines: GPUBufferSet;
    outlines: GPUBufferSet;
    polygons: GPUBufferSet;
    constructor(pointStrips: Float32Array[]){
        let outlineData = bufferConstructor.outlineBuffer(pointStrips);
        this.outlines = outlineData.buffer;
        let lineData = bufferConstructor.lineBuffer(pointStrips);
        this.lines = lineData.buffer;
        let polygonData = bufferConstructor.polygonBuffer(pointStrips);
        this.polygons = polygonData.buffer;
        
    }
    draw(viewMatrix: Float32Array){

    }
}