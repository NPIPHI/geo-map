import { Feature } from "./feature";
export interface BoundingBox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}
export interface Layer {
    zIndex: number;
    addFeatures(pointStrips: Float32Array[], ids: string[]): void;
    addFeature(pointStrip: Float32Array, id: string): void;
    selectByPoint(x: number, y: number): Feature;
    selectByRectangle(boundingBox: BoundingBox): Feature[];
    selectByID(id: string): Feature;
    remove(feature: Feature): void;
    setStyle(feature: Feature, style: number): void;
    setStyleTable(type: "polygon" | "outline", zoomLevel: "in" | "out", styleIndex: number, r: number, g: number, b: number, thickness?: number): void;
}
export declare class GeoMap {
    layers: Layer[];
    private gl;
    private bBox;
    constructor(canvas: HTMLCanvasElement);
    addLayer(region: BoundingBox, zIndex?: number): void;
}
