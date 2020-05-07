import { Feature } from "./feature";
import { GPUBufferSet } from "./memory";
import { boundingBox } from "./kdTree";
export declare class mapLayer {
    private featureTree;
    zIndex: number;
    outlines: GPUBufferSet;
    polygons: GPUBufferSet;
    styleTable: {
        polygon: Float32Array[];
        outline: Float32Array[];
    };
    constructor();
    addFeatures(pointStrips: Float32Array[], ids: string[]): void;
    addFeature(pointStrip: Float32Array, id: string): void;
    selectByPoint(x: number, y: number): Feature | undefined;
    selectByRectangle(bBox: boundingBox): Feature[];
    selectByID(id: string): void;
    remove(x: number, y: number): void;
    setStyle(feature: Feature, style: number): void;
    setStyleTable(type: "polygon" | "outline", zoomLevel: "in" | "out", styleIndex: number, r: number, g: number, b: number, thickness?: number): void;
    setStyleTableFromArray(type: "polygon" | "outline", zoomInArray: ArrayLike<number>, zoomOutArray: ArrayLike<number>, offset?: number): void;
}
