import { mat3 } from "gl-matrix";

let aespectRatio: number = 1;

export class camera extends Float32Array {
    static getView(x: number, y: number, scaleX: number, scaleY: number){
        let arr = new Float32Array(9);
        arr[0] = scaleX / aespectRatio;
        arr[4] = scaleY;
        arr[6] = x * scaleX / aespectRatio;
        arr[7] = y * scaleY;
        return arr;
    }
    static setAespectRatio(width: number, height: number){
        aespectRatio = width/height;
    }
    static toWorldSpace(x: number, y: number, cam: {x: number, y: number, scaleX: number, scaleY: number}, canvas: HTMLCanvasElement): {x: number, y: number}{
        return {x: (x / canvas.width - 0.5) * canvas.width / canvas.height * 2 / cam.scaleX - cam.x, y: (-y / canvas.height + 0.5) * 2 / cam.scaleY - cam.y}
    }
}