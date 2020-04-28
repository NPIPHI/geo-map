import { mat3 } from "gl-matrix";

let aespectRatio: number = 1;

export class camera extends Float32Array {
    static getView(x: number, y: number, scaleX: number, scaleY: number){
        let arr = new Float32Array(9);
        arr[0] = scaleX / aespectRatio;
        arr[4] = scaleY;
        arr[6] = x * scaleX;
        arr[7] = y * scaleY;
        return arr;
    }
    static setAespectRatio(width: number, height: number){
        aespectRatio = width/height;
    }
}