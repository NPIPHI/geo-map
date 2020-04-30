import { Feature } from "./feature";
import { GPUBufferSet, GPUMemoryPointer, GPUMemoryObject } from "./memory";
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
        return this.features.findIndex(feature=>feature.boundingBox.contains(x,y));
    }
    setStyle(feature: Feature | number, style: number){
        if(feature === undefined || feature === -1){
            console.warn("feature was undefined");
            return
        }
        if(typeof feature === "number"){
            feature = this.features[feature];
        }
        let styleData = new Int32Array(feature.outline.GPUWidth);
        for(let i = 0; i < styleData.length; i++){
            styleData[i] = style;
        }
        if(feature.outline instanceof GPUMemoryPointer){
            feature.outline = feature.outline.toMemoryObject([new Float32Array(), new Float32Array(), styleData]);
        } else {
            feature.outline.GPUData[2] = styleData;
        }
        this.outlines.update(feature.outline, 2);
    }
    remove(feature: Feature | number){
        if(feature === undefined){
            console.warn("feature was undefined");
            return
        }
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