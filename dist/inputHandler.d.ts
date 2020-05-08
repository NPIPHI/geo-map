import { camera } from "./camera";
import { Layer } from "./index";
export declare class inputHandler {
    targets: Layer[];
    private camera;
    private mouse;
    private touch1;
    private touch2;
    private newTouch;
    private invalidate;
    minimumHoverTime: number;
    maximumHoverDistance: number;
    smoothTransitionFactor: number;
    constructor(canvas: HTMLCanvasElement, camera: camera, invalidateCallback: () => void);
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
