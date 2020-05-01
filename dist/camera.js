"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let aespectRatio = 1;
class camera extends Float32Array {
    static getView(x, y, scaleX, scaleY) {
        let arr = new Float32Array(9);
        arr[0] = scaleX / aespectRatio;
        arr[4] = scaleY;
        arr[6] = x * scaleX / aespectRatio;
        arr[7] = y * scaleY;
        return arr;
    }
    static setAespectRatio(width, height) {
        aespectRatio = width / height;
    }
    static toWorldSpace(x, y, cam, canvas) {
        return { x: (x / canvas.width - 0.5) * canvas.width / canvas.height * 2 / cam.scaleX - cam.x, y: (-y / canvas.height + 0.5) * 2 / cam.scaleY - cam.y };
    }
}
exports.camera = camera;
