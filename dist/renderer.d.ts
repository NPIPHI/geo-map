import { mapLayer } from "./map";
import { mat3 } from "gl-matrix";
export declare class mapRenderer {
    private gl;
    private polyProgam;
    private outlineProgram;
    private styleTransitionBoundry;
    private styleTables;
    constructor(gl: WebGL2RenderingContext);
    setTransitionBoundry(min: number, max: number): void;
    private getTransitionScalar;
    private getZoomLevel;
    renderMap(map: mapLayer, viewMatrix: mat3, poly: boolean, outline: boolean): void;
    private renderLine2d;
    private renderLine2dFromBuffer;
    private renderPolygon2d;
    private renderPolygon2dFromBuffer;
    private renderOutline2d;
    private renderOutline2dFromBuffer;
    clear(): void;
    private initShaderProgram;
    private loadShader;
}
