import { mapLayer } from "./map";
import { Layer, BoundingBox } from "./index";
import { bufferConstructor } from "./bufferConstructor";
export declare function loadMapBinary(): Promise<{
    points: Float64Array[];
    ids: string[];
}>;
export declare function loadMapChuncksBinary(dir: string, region: BoundingBox, constructor: bufferConstructor): Layer;
export declare function addMapBinary(path: string, target: Layer): Promise<void>;
export declare function loadMapChuncks(dir: string, region: BoundingBox, constructor: bufferConstructor): mapLayer;
export declare function addMapJson(path: string, target: Layer): Promise<void>;
