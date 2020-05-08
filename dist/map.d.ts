import { Feature } from "./feature";
import { GPUBufferSet } from "./memory";
import { bufferConstructor } from "./bufferConstructor";
import { boundingBox } from "./kdTree";
import { Layer, BoundingBox } from "./index";
export declare class mapLayer implements Layer {
    private featureTree;
    private bufferConstructor;
    private bBox;
    private hoverListeners;
    private mouseoverListeners;
    private pointerdownListeners;
    private pointerupListeners;
    zIndex: number;
    name: string;
    outlines: GPUBufferSet;
    polygons: GPUBufferSet;
    styleTable: {
        polygon: Float32Array[];
        outline: Float32Array[];
    };
    constructor(name: string, bBox: BoundingBox, bufferConstructor: bufferConstructor, zIndex?: number);
    addEventListener(type: "hover" | "mouseover" | "pointerdown" | "pointerup", callback: (arg0: Feature) => void): void;
    callEventListener(type: "hover" | "mouseover" | "pointerdown" | "pointerup", point: {
        x: number;
        y: number;
    }): void;
    addFeatures(pointStrips: Float64Array[], ids: string[]): void;
    addFeature(pointStrip: Float64Array, id: string): void;
    selectByPoint(x: number, y: number): Feature | undefined;
    selectByRectangle(bBox: boundingBox): Feature[];
    selectByID(id: string): Feature;
    remove(feature: Feature): void;
    popByPoint(x: number, y: number): void;
    setStyle(feature: Feature, style: number): void;
    setStyleTable(type: "polygon" | "outline", zoomLevel: "in" | "out", styleIndex: number, r: number, g: number, b: number, thickness?: number): void;
    setStyleTableFromArray(type: "polygon" | "outline", zoomInArray: ArrayLike<number>, zoomOutArray: ArrayLike<number>, offset?: number): void;
}
