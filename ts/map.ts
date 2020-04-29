import { feature } from "./feature";
import { GPUBufferSet, GPUMemoryPointer } from "./memory";
import { bufferConstructor } from "./bufferConstructor"

export class geoMap{
    features: feature[];
    outlines: GPUBufferSet;
    polygons: GPUBufferSet;
    constructor(pointStrips: Float32Array[]){
        let outlineData = bufferConstructor.outlineBuffer(pointStrips);
        this.outlines = outlineData.buffer;
        let polygonData = bufferConstructor.polygonBuffer(pointStrips);
        this.polygons = polygonData.buffer;

        this.features = [];
        for(let i = 0; i < pointStrips.length; i++){
            this.features.push(new feature(new GPUMemoryPointer(outlineData.features.offsets[i], outlineData.features.widths[i]),
                                            new GPUMemoryPointer(polygonData.features.offsets[i], polygonData.features.widths[i])));
        }
    }
    draw(viewMatrix: Float32Array){

    }
}