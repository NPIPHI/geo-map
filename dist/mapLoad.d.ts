import { mapLayer } from "./map";
export declare function loadMap(): Promise<{
    points: Float32Array[];
    ids: string[];
}>;
export declare function parseMapJson(path?: string): Promise<{
    points: Float32Array[];
    ids: string[];
}>;
export declare function loadMapChuncks(dir: string): mapLayer;
