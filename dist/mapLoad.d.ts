import { mapLayer } from "./map";
import { Layer } from "./index";
export declare function loadMapBinary(): Promise<{
    points: Float64Array[];
    ids: string[];
}>;
export declare function loadMapChuncksBinary(dir: string, target: Layer): void;
export declare function addMapBinary(path: string, target: Layer): Promise<void>;
export declare function loadMapChuncksJSON(dir: string, target: mapLayer): void;
export declare function addMapJson(path: string, target: Layer): Promise<void>;
