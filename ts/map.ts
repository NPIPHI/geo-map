import { feature } from "./feature";
import { GPUBufferSet } from "./memory";

export class geoMap{
    features: feature[];
    lines: GPUBufferSet;
    outlines: GPUBufferSet;
    polygons: GPUBufferSet;
    constructor(pointStrips: Float32Array[]){
        let time1 = performance.now();
        this.features = pointStrips.map(strip=> new feature(strip));
        this.lines = GPUBufferSet.create([2*4, 3*4]);
        this.outlines  = GPUBufferSet.create([2*4, 2*4, 1*4]);
        this.polygons  = GPUBufferSet.create([2*4, 3*4]);
        let time2 = performance.now();
        this.lines.addArray(this.features.map(feature=>feature.line))
        this.outlines.addArray(this.features.map(feature=>feature.outline))
        this.polygons.addArray(this.features.map(feature=>feature.polygon))
        let time3 = performance.now();
        console.log(`create features: ${time2 - time1}`);
        console.log(`dense arrays: ${time3 - time2}`);
    }
    draw(viewMatrix: Float32Array){

    }
}