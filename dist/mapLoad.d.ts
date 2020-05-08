import { mapLayer } from "./map";
import { Layer } from "./index";
export declare function loadMapBinary(): Promise<{
    points: Float32Array[];
    ids: string[];
}>;
export declare function loadMapChuncksBinary(dir: string): Layer;
export declare function addMapBinary(path: string, target: Layer): Promise<void>;
export declare function loadMapChuncks(dir: string): mapLayer;
export declare function addMapJson(path: string, target: Layer): Promise<void>;
