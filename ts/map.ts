import { Feature } from "./feature";
import { GPUBufferSet, GPUMemoryPointer } from "./memory";
import { bufferConstructor } from "./bufferConstructor"

export class geoMap{
    features: Feature[];
    outlines: GPUBufferSet;
    polygons: GPUBufferSet;
    constructor(pointStrips: Float32Array[]){
        let time1 = performance.now();
        let outlineData = bufferConstructor.outlineBuffer(pointStrips);
        this.outlines = outlineData.buffer;
        let time2 = performance.now();
        let polygonData = bufferConstructor.polygonBuffer(pointStrips);
        this.polygons = polygonData.buffer;
        let time3 = performance.now();
        console.log(time2-time1);
        console.log(time3-time2);

        this.features = [];
        for(let i = 0; i < pointStrips.length; i++){
            this.features.push(new Feature(pointStrips[i],
                                            new GPUMemoryPointer(outlineData.features.offsets[i], outlineData.features.widths[i]),
                                            new GPUMemoryPointer(polygonData.features.offsets[i], polygonData.features.widths[i])));
        }
    }
    select(x: number, y: number){
        return this.features.find(feature=>feature.boundingBox.contains(x,y));
    }
    remove(feature: Feature | number){
        if(typeof feature === "number"){
            let removed = this.features.splice(feature, 1)[0];
            this.outlines.remove(removed.outline);
            this.polygons.remove(removed.polygon);
        } else {
            this.features.splice(this.features.indexOf(feature),1);
            this.outlines.remove(feature.outline);
            this.polygons.remove(feature.polygon);
        }
    }
}