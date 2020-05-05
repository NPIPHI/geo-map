import * as matrix from "gl-matrix";
export declare class camera {
    view: matrix.mat3;
    private canvasView;
    private lastpoint;
    constructor(width?: number, height?: number);
    touchDown(x: number, y: number): void;
    touchMove(x: number, y: number): void;
    zoom(scalar: number, x?: number, y?: number): void;
    setAespectRatio(width: number, height: number): void;
    toWorldSpace(x: number, y: number): {
        x: number;
        y: number;
    };
    getZoom(): number;
}
