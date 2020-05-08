import * as matrix from "gl-matrix"
import { BoundingBox } from "./index";

export class camera {
    private _view: matrix.mat3;
    private canvasView: matrix.mat3;
    private aespectRatioView: matrix.mat3;
    private aespectRatioInverse: matrix.mat3;
    private inverseView: matrix.mat3;
    private worldSpaceTransform: matrix.mat3;
    private onePointTouchLocation: matrix.vec2;

    private twoPointTouchLocations: {p1: matrix.vec2, p2: matrix.vec2}
    constructor(worldRegion: BoundingBox, width?: number, height?: number){
        this.aespectRatioView = matrix.mat3.create();
        this.aespectRatioInverse = matrix.mat3.create();
        this.canvasView = matrix.mat3.create();
        this._view = matrix.mat3.create();
        this.inverseView = matrix.mat3.create();
        this.worldSpaceTransform = matrix.mat3.create();
        this.onePointTouchLocation = matrix.vec2.create();
        this.twoPointTouchLocations = {p1: matrix.vec2.create(), p2: matrix.vec2.create()}
        if(width && height){
            this.setAespectRatio(width, height);
        }
        this.setWorldSpace(worldRegion);
    }
    get view(): matrix.mat3{
        //return new Float32Array(this._view);
        return new Float32Array(matrix.mat3.multiply(matrix.mat3.create(), this.aespectRatioView, this._view));
    }
    onePointDown(x: number, y: number){
        matrix.vec2.transformMat3(this.onePointTouchLocation, [x, y], this.canvasView);
        matrix.vec2.transformMat3(this.onePointTouchLocation, this.onePointTouchLocation, this.aespectRatioInverse);
        matrix.vec2.transformMat3(this.onePointTouchLocation, this.onePointTouchLocation, this.inverseView);
    }
    onePointMove(x: number, y: number){
        let newPoint = new Float32Array([x, y]);
        this.inverseView = matrix.mat3.invert(matrix.mat3.create(), this._view);
        matrix.vec2.transformMat3(newPoint, newPoint, this.canvasView);
        matrix.vec2.transformMat3(newPoint, newPoint, this.aespectRatioInverse);
        matrix.vec2.transformMat3(newPoint, newPoint, this.inverseView);
        matrix.mat3.translate(this._view, this._view, matrix.vec2.sub(newPoint, newPoint, this.onePointTouchLocation));
        this.inverseView = matrix.mat3.invert(this.inverseView, this._view);
    }
    zoom(scalar: number, x?: number, y?: number){
        let origin: matrix.vec2;
        if(x != undefined && y != undefined){
            origin = new Float32Array([x, y])
            
        } else {
            origin = new Float32Array([0, 0])
        }
        matrix.vec2.transformMat3(origin, origin, this.canvasView);
        matrix.vec2.transformMat3(origin, origin, this.aespectRatioInverse);

        let transform = matrix.mat3.create();
        matrix.mat3.scale(transform, transform, [scalar, scalar]);
        let delta = matrix.vec2.create();
        matrix.vec2.sub(delta, origin, matrix.vec2.transformMat3(matrix.vec2.create(), origin, transform));
        matrix.mat3.identity(transform);
        matrix.mat3.translate(transform, transform, delta);
        matrix.mat3.scale(transform, transform, [scalar, scalar])
        matrix.mat3.multiply(this._view, transform, this._view);
        matrix.mat3.invert(this.inverseView, this._view);
    }
    twoPointDown(p1: {x: number, y: number}, p2: {x: number, y: number}){
        this.twoPointTouchLocations.p1 = matrix.vec2.fromValues(p1.x, p1.y);
        this.twoPointTouchLocations.p2 = matrix.vec2.fromValues(p2.x, p2.y);
        matrix.vec2.transformMat3(this.twoPointTouchLocations.p1, this.twoPointTouchLocations.p1, this.canvasView);
        matrix.vec2.transformMat3(this.twoPointTouchLocations.p2, this.twoPointTouchLocations.p2, this.canvasView);
        matrix.vec2.transformMat3(this.twoPointTouchLocations.p1, this.twoPointTouchLocations.p1, this.aespectRatioInverse);
        matrix.vec2.transformMat3(this.twoPointTouchLocations.p2, this.twoPointTouchLocations.p2, this.aespectRatioInverse);
        matrix.vec2.transformMat3(this.twoPointTouchLocations.p1, this.twoPointTouchLocations.p1, this.inverseView);
        matrix.vec2.transformMat3(this.twoPointTouchLocations.p2, this.twoPointTouchLocations.p2, this.inverseView);
    }
    
    twoPointMove(p1: {x: number, y: number}, p2: {x: number, y: number}){
        let point1 = matrix.vec2.fromValues(p1.x, p1.y);
        let point2 = matrix.vec2.fromValues(p2.x, p2.y);
        matrix.vec2.transformMat3(point1, point1, this.canvasView);
        matrix.vec2.transformMat3(point2, point2, this.canvasView);
        matrix.vec2.transformMat3(point1, point1, this.aespectRatioInverse);
        matrix.vec2.transformMat3(point2, point2, this.aespectRatioInverse);
        matrix.vec2.transformMat3(point1, point1, this.inverseView);
        matrix.vec2.transformMat3(point2, point2, this.inverseView);
        
        let point3 = matrix.vec2.lerp(matrix.vec2.create(), point1, point2, 0.5);
        matrix.vec2.add(point3, point3, matrix.vec2.fromValues(-(point2[1] - point1[1]), point2[0] - point1[0]));

        let targetPoint3 = matrix.vec2.lerp(matrix.vec2.create(), this.twoPointTouchLocations.p1, this.twoPointTouchLocations.p2, 0.5);
        matrix.vec2.add(targetPoint3, targetPoint3, matrix.vec2.fromValues(-(this.twoPointTouchLocations.p2[1] - this.twoPointTouchLocations.p1[1]), this.twoPointTouchLocations.p2[0] - this.twoPointTouchLocations.p1[0]));
        let sourceMatrix = new Float32Array([...point1, 1, ...point2, 1, ...point3, 1]);
        let targetMatrix = new Float32Array([...this.twoPointTouchLocations.p1, 1, ...this.twoPointTouchLocations.p2, 1, ...targetPoint3, 1])
        let inverse = matrix.mat3.create()
        matrix.mat3.invert(inverse, sourceMatrix)
        let transform = matrix.mat3.multiply(matrix.mat3.create(), targetMatrix, inverse);
        transform[8] = 1;
        transform[4] = transform[0];
        transform[1] = -transform[3];
        transform[2] = 0;
        transform[5] = 0;
        matrix.mat3.multiply(this.inverseView, transform, this.inverseView);
       
        matrix.mat3.invert(this._view, this.inverseView);

        //TODO make more stable, floating point errors galore

    }
    setAespectRatio(width: number, height: number){
        matrix.mat3.fromScaling(this.aespectRatioView, [1, width/height])
        matrix.mat3.invert(this.aespectRatioInverse, this.aespectRatioView)
        matrix.mat3.fromTranslation(this.canvasView, [-1, 1]);
        matrix.mat3.scale(this.canvasView, this.canvasView, [2/width, -2/height])
    } 
    setWorldSpace(rect: BoundingBox){
        matrix.mat3.fromTranslation(this.worldSpaceTransform, [rect.x1, rect.y1]);
        matrix.mat3.scale(this.worldSpaceTransform, this.worldSpaceTransform, [(rect.x2 - rect.x1), (rect.y2 - rect.y1)]);
    }
    toWorldSpace(x: number, y: number): {x: number, y: number}{
        let res = new Float32Array([x, y]);
        matrix.vec2.transformMat3(res, res, this.canvasView);
        matrix.vec2.transformMat3(res, res, this.aespectRatioInverse);
        matrix.vec2.transformMat3(res, res, this.inverseView);
        matrix.vec2.transformMat3(res, res, this.worldSpaceTransform);
        return {x: res[0], y: res[1]}
    }
    getZoom(){
        return Math.hypot(this._view[0], this._view[1]); //to allow for rotations
    }
}