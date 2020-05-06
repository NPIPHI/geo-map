import * as matrix from "gl-matrix";
export declare class camera {
    private _view;
    private canvasView;
    private aespectRatioView;
    private aespectRatioInverse;
    private inverseView;
    private onePointTouchLocation;
    private twoPointTouchLocations;
    constructor(width?: number, height?: number);
    get view(): matrix.mat3;
    onePointDown(x: number, y: number): void;
    onePointMove(x: number, y: number): void;
    zoom(scalar: number, x?: number, y?: number): void;
    twoPointDown(p1: {
        x: number;
        y: number;
    }, p2: {
        x: number;
        y: number;
    }): void;
    twoPointMove(p1: {
        x: number;
        y: number;
    }, p2: {
        x: number;
        y: number;
    }): void;
    setAespectRatio(width: number, height: number): void;
    toWorldSpace(x: number, y: number): {
        x: number;
        y: number;
    };
    getZoom(): number;
}
