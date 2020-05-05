import * as matrix from "gl-matrix"

export class camera {
    view: matrix.mat3;
    private canvasView: matrix.mat3;
    private inverseView: matrix.mat3;
    private onePointTouchLocation: matrix.vec2;
    private twoPointTouchLocations: {p1: matrix.vec2, p2: matrix.vec2}
    constructor(width?: number, height?: number){
        this.canvasView = matrix.mat3.create();
        this.view = matrix.mat3.create();
        this.inverseView = matrix.mat3.create();
        this.onePointTouchLocation = matrix.vec2.create();
        this.twoPointTouchLocations = {p1: matrix.vec2.create(), p2: matrix.vec2.create()}
        if(width && height){
            this.setAespectRatio(width, height);
        }
    }
    onePointDown(x: number, y: number){
        matrix.vec2.transformMat3(this.onePointTouchLocation, [x, y], this.canvasView);
        matrix.vec2.transformMat3(this.onePointTouchLocation, this.onePointTouchLocation, this.inverseView);
    }
    onePointMove(x: number, y: number){
        let newPoint = new Float32Array([x, y]);
        this.inverseView = matrix.mat3.invert(matrix.mat3.create(), this.view);
        matrix.vec2.transformMat3(newPoint, newPoint, this.canvasView);
        matrix.vec2.transformMat3(newPoint, newPoint, this.inverseView);
        matrix.mat3.translate(this.view, this.view, matrix.vec2.sub(newPoint, newPoint, this.onePointTouchLocation));
        this.inverseView = matrix.mat3.invert(this.inverseView, this.view);
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
        matrix.mat3.invert(this.inverseView, this.view);
    }
    twoPointDown(p1: {x: number, y: number}, p2: {x: number, y: number}){
        this.twoPointTouchLocations.p1 = matrix.vec2.fromValues(p1.x, p1.y);
        this.twoPointTouchLocations.p2 = matrix.vec2.fromValues(p2.x, p2.y);
        matrix.vec2.transformMat3(this.twoPointTouchLocations.p1, this.twoPointTouchLocations.p1, this.canvasView);
        matrix.vec2.transformMat3(this.twoPointTouchLocations.p2, this.twoPointTouchLocations.p2, this.canvasView);
        matrix.vec2.transformMat3(this.twoPointTouchLocations.p1, this.twoPointTouchLocations.p1, this.inverseView);
        matrix.vec2.transformMat3(this.twoPointTouchLocations.p2, this.twoPointTouchLocations.p2, this.inverseView);
    }
    
    twoPointMove(p1: {x: number, y: number}, p2: {x: number, y: number}){
        let point1 = matrix.vec2.fromValues(p1.x, p1.y);
        let point2 = matrix.vec2.fromValues(p2.x, p2.y);
        matrix.vec2.transformMat3(point1, point1, this.canvasView);
        matrix.vec2.transformMat3(point2, point2, this.canvasView);
        matrix.vec2.transformMat3(point1, point1, this.inverseView);
        matrix.vec2.transformMat3(point2, point2, this.inverseView);
        

        //just insert third point lamo, then use A * T = B, T = A' B
        let point3 = matrix.vec2.lerp(matrix.vec2.create(), point1, point2, 0.5);
        matrix.vec2.add(point3, point3, matrix.vec2.fromValues(-(point2[1] - point1[1]), point2[0] - point1[0]));

        let targetPoint3 = matrix.vec2.lerp(matrix.vec2.create(), this.twoPointTouchLocations.p1, this.twoPointTouchLocations.p2, 0.5);
        matrix.vec2.add(targetPoint3, targetPoint3, matrix.vec2.fromValues(-(this.twoPointTouchLocations.p2[1] - this.twoPointTouchLocations.p1[1]), this.twoPointTouchLocations.p2[0] - this.twoPointTouchLocations.p1[0]));
        let sourceMatrix = new Float32Array([...point1, 1, ...point2, 1, ...point3, 1]);
        let targetMatrix = new Float32Array([...this.twoPointTouchLocations.p1, 1, ...this.twoPointTouchLocations.p2, 1, ...targetPoint3, 1])
        //matrix.mat3.transpose(sourceMatrix, sourceMatrix);
        //matrix.mat3.transpose(targetMatrix, targetMatrix);
        let inverse = matrix.mat3.create()
        matrix.mat3.invert(inverse, sourceMatrix)
        let transform = matrix.mat3.multiply(matrix.mat3.create(), targetMatrix, inverse);
        //matrix.mat3.transpose(transform, transform);
        // let targetAngle = Math.atan2(this.twoPointTouchLocations.p2[1] - this.twoPointTouchLocations.p1[1], this.twoPointTouchLocations.p2[0] - this.twoPointTouchLocations.p1[0]);
        // let angle = Math.atan2(point2[1] - point1[1], point2[0] - point1[0]);
        // let targetDistance = matrix.vec2.distance(this.twoPointTouchLocations.p1, this.twoPointTouchLocations.p2);
        // let distance = matrix.vec2.distance(point1, point2);

        // matrix.mat3.translate(transform, transform, matrix.vec2.scale(matrix.vec2.create(), point1, -1));
        // matrix.mat3.rotate(transform, transform, targetAngle - angle);
        // matrix.mat3.scale(transform, transform, [targetDistance/distance, targetDistance/distance]);
        // matrix.mat3.translate(transform, transform, this.twoPointTouchLocations.p1);
        transform[8] = 1;
        transform[2] = 0;
        transform[5] = 0;
        matrix.mat3.multiply(this.inverseView, transform, this.inverseView);
        matrix.mat3.invert(this.view, this.inverseView);

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
        return Math.hypot(this.view[0], this.view[1]); //to allow for rotations
    }
}