import { Feature } from "./feature";
import { mapLayer } from "./map";

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

export class GeoMap{
    layers: Layer[];
    private gl: WebGL2RenderingContext;
    private bBox: BoundingBox;
    constructor(canvas: HTMLCanvasElement){
        this.gl = canvas.getContext("webgl2");
    }
    addLayer(region: BoundingBox, zIndex: number = 0){
        //region represents the bounding box containing the elemnts of the map
        //accurate region information improves feature selection time
        //it is possible to add elements outside of the region
        //the view is automaticly set to show the region
        this.layers.push(new mapLayer(zIndex));
    }
}