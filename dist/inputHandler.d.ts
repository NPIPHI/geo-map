import { camera } from "./camera";
import { Layer } from "./index";
export declare class inputHandler {
    targets: Layer[];
    private camera;
    private mouse;
    private touch1;
    private touch2;
    private newTouch;
    constructor(canvas: HTMLCanvasElement, camera: camera);
    private invalidateCanvas;
    private touchstart;
    private touchmove;
    private touchend;
    private updateTouches;
    private mousedown;
    private mousemove;
    private mouseup;
    private mousewheel;
    private callListeners;
}
