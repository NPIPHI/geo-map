import * as matrix from "gl-matrix"

export class camera {
    view: matrix.mat3;
    private canvasView: matrix.mat3;
    private inverseView: matrix.mat3;
    private lastpoint: matrix.vec2;
    constructor(width?: number, height?: number){
        this.canvasView = matrix.mat3.create();
        this.view = matrix.mat3.create();
        this.inverseView = matrix.mat3.create();
        this.lastpoint = matrix.vec2.create();
        if(width && height){
            this.setAespectRatio(width, height);
        }
    }
    touchDown(x: number, y: number){
        matrix.vec2.transformMat3(this.lastpoint, [x, y], this.canvasView);
        matrix.vec2.transformMat3(this.lastpoint, this.lastpoint, this.inverseView);
    }
    touchMove(x: number, y: number){
        let newPoint = new Float32Array([x, y]);
        this.inverseView = matrix.mat3.invert(matrix.mat3.create(), this.view);
        matrix.vec2.transformMat3(newPoint, newPoint, this.canvasView);
        matrix.vec2.transformMat3(newPoint, newPoint, this.inverseView);
        matrix.mat3.translate(this.view, this.view, matrix.vec2.sub(newPoint, newPoint, this.lastpoint));
        this.inverseView = matrix.mat3.invert(matrix.mat3.create(), this.view);
    }
    zoom(scalar: number, x?: number, y?: number){
        let origin: matrix.vec2;
        if(x != undefined && y != undefined){
            origin = new Float32Array([x, y])
            
        } else {
            origin = new Float32Array([0, 0])
        }
        matrix.vec2.transformMat3(origin, origin, this.canvasView);

        let transform = matrix.mat3.create();
        matrix.mat3.scale(transform, transform, [scalar, scalar]);
        let delta = matrix.vec2.create();
        matrix.vec2.sub(delta, origin, matrix.vec2.transformMat3(matrix.vec2.create(), origin, transform));
        matrix.mat3.identity(transform);
        matrix.mat3.translate(transform, transform, delta);
        matrix.mat3.scale(transform, transform, [scalar, scalar])
        matrix.mat3.multiply(this.view, transform, this.view);
        this.inverseView = matrix.mat3.invert(matrix.mat3.create(), this.view);
    }
    setAespectRatio(width: number, height: number){
        matrix.mat3.fromTranslation(this.canvasView, [-1, 1]);
        matrix.mat3.scale(this.canvasView, this.canvasView, [2/width, -2/height])
    }
    toWorldSpace(x: number, y: number): {x: number, y: number}{
        let res = new Float32Array([x, y]);
        matrix.vec2.transformMat3(res, res, this.canvasView);
        matrix.vec2.transformMat3(res, res, this.inverseView);
        return {x: res[0], y: res[1]}
    }
    getZoom(){
        return this.view[0];
    }
}