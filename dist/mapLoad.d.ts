import { mapLayer } from "./map";
export declare function loadMapBinary(): Promise<{
    points: Float32Array[];
    ids: string[];
}>;
export declare function loadMapChuncksBinary(dir: string): mapLayer;
export declare function loadMapChuncks(dir: string): mapLayer;
