import { Feature } from "./feature";
export interface BoundingBox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}
export interface Layer {
    zIndex: number;
    name: string;
    addFeatures(pointStrips: Float64Array[], ids: string[]): void;
    addFeature(pointStrip: Float64Array, id: string): void;
    selectByPoint(x: number, y: number): Feature;
    selectByRectangle(boundingBox: BoundingBox): Feature[];
    selectByID(id: string): Feature;
    remove(feature: Feature): void;
    setStyle(feature: Feature, style: number): void;
    addEventListener(type: "hover" | "mouseover" | "pointerdown" | "pointerup", callback: (arg0: Feature) => void): void;
    callEventListener(type: "hover" | "mouseover" | "pointerdown" | "pointerup", point: {
        x: number;
        y: number;
    }): void;
    setStyleTable(type: "polygon" | "outline", zoomLevel: "in" | "out", styleIndex: number, r: number, g: number, b: number, thickness?: number): void;
}
export declare class GeoMap {
    layers: Layer[];
    private gl;
    private bBox;
    private squareRegion;
    private renderer;
    private camera;
    private bufferConstructor;
    private inputHandler;
    constructor(canvas: HTMLCanvasElement, region: BoundingBox);
    private render;
    createLayer(name: string, zIndex?: number): Layer;
    addLayer(layer: Layer): void;
    addData(layer: Layer, geometry: Float64Array[], ids: string[]): Promise<void>;
    loadData(layer: Layer, path: string, encoding: "binary" | "json"): Promise<void>;
    loadDataChuncks(layer: Layer, dir: string, encoding: "binary" | "json"): Promise<void>;
}
