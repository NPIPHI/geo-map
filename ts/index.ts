import { Feature } from "./feature";
import { mapLayer } from "./map";
import { mapRenderer } from "./renderer";
import { addMapBinary, addMapJson } from "./mapLoad";

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
    private renderer: mapRenderer;
    constructor(canvas: HTMLCanvasElement, region: BoundingBox){
        //region represents the bounding box containing the elemnts of the map
        //accurate region information improves feature selection performance (~10x)
        //it is possible to add elements outside of the region
        //the view is automaticly set to show the region
        this.bBox = region;
        this.gl = canvas.getContext("webgl2");
        this.renderer = new mapRenderer(this.gl);
    }
    addLayer(zIndex: number = 0): void{
        this.layers.push(new mapLayer(zIndex));
    }
    addData(layer: Layer, geometry: Float32Array[], ids: string[]): void{
        layer.addFeatures(geometry, ids);
    }
    async addDataJSON(layer: Layer, path: string): Promise<void>{
        return addMapJson(path, layer);
    }
    async addDataBinary(layer: Layer, path: string): Promise<void>{
        return addMapBinary(path, layer);
    }
}