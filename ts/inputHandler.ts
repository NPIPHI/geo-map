import { camera } from "./camera";
import { Layer, gl } from "./index";

export class inputHandler{
    targets: Layer[];
    private camera: camera;
    private mouse: {x: number, y: number, left: boolean, right: boolean, middle: boolean};
    private touch1: Touch;
    private touch2: Touch;
    private newTouch: Touch;
    private invalidate: ()=>void;
    private canvas: HTMLCanvasElement;
    minimumHoverTime: number = 100;
    maximumHoverDistance: number = 0;
    smoothTransitionFactor: number = 1;
    constructor(canvas: HTMLCanvasElement, camera: camera, invalidateCallback: ()=>void){
        this.canvas = canvas;
        this.camera = camera;
        this.mouse = {x: 0, y: 0, left: false, right: false, middle: false};
        this.targets = [];
        this.invalidate = invalidateCallback;
        this.resizeCanvas();
        canvas.addEventListener("pointerdown", (pointer)=>this.mousedown(pointer.offsetX, pointer.offsetY, pointer.button));
        canvas.addEventListener("pointermove", (pointer)=>this.mousemove(pointer.offsetX, pointer.offsetY));
        canvas.addEventListener("pointerup", (pointer)=>this.mouseup(pointer.offsetX, pointer.offsetY, pointer.button));
        canvas.addEventListener("wheel", (pointer)=>this.mousewheel(pointer.deltaY));
        canvas.addEventListener("touchstart", event=>this.touchstart(event));
        canvas.addEventListener("touchmove", event=>this.touchmove(event));
        canvas.addEventListener("touchend", event=>this.touchend(event));
        window.addEventListener("resize", event=>this.resizeCanvas());
    }

    private resizeCanvas(){
        this.canvas.width = this.canvas.getBoundingClientRect().width;
        this.canvas.height = this.canvas.getBoundingClientRect().height;
        this.camera.setAespectRatio(this.canvas.width, this.canvas.height);
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.invalidateCanvas();
    }

    private invalidateCanvas(){
        this.invalidate();
    }

    private touchstart(event: TouchEvent){
        event.preventDefault();
        this.updateTouches(event);
        if(!this.touch1){
            this.touch1 = this.newTouch;
        } else if(!this.touch2){
            this.touch2 = this.newTouch;
            this.camera.twoPointDown({x: this.touch1.clientX, y: this.touch1.clientY}, {x: this.touch2.clientX, y: this.touch2.clientY})
            this.invalidateCanvas();
        }
    }

    private touchmove(event: TouchEvent){
        this.updateTouches(event);
        event.preventDefault();
        if(this.touch1 && ! this.touch2){
            this.mousemove(this.touch1.clientX, this.touch1.clientY);
        }
        if(this.touch1 && this.touch2){
            this.camera.twoPointMove({x: this.touch1.clientX, y: this.touch1.clientY}, {x: this.touch2.clientX, y: this.touch2.clientY})
            this.invalidateCanvas();
        }
    }

    private touchend(event: TouchEvent){
        this.updateTouches(event);
        if(this.touch2 && !this.touch1){
            this.touch2 = this.touch1;
        }
    }
    private updateTouches(event: TouchEvent){
        let t1ID = null;
        let t2ID = null;
        if(this.touch1){
            t1ID = this.touch1.identifier;
        }
        if(this.touch2){
            t2ID = this.touch2.identifier;
        }
        this.touch1 = undefined;
        this.touch2 = undefined;
        for (let i = 0; i < event.touches.length; i++) {
            const touch = event.touches[i];
            if(touch.identifier == t1ID){
                this.touch1 = touch;
            } else if(touch.identifier == t2ID){
                this.touch2 = touch;
            } else {
                this.newTouch = touch;
            }
        }
    }

    private mousedown(x: number, y: number, button: number){
        this.mouse.x = x;
        this.mouse.y = x;
        if (button === 0) {//left mouse button
            this.camera.onePointDown(x, y)
            this.mouse.left = true;
            this.callListeners("pointerdown", {x, y})
        }
        console.log("touched");
    }
    private mousemove(x: number, y: number){
        this.mouse.x = x;
        this.mouse.y = y;
        if (this.mouse.left){
            this.camera.onePointMove(x, y);
            this.invalidateCanvas();
        }
    }
    private mouseup(x: number, y: number, button: number){
        if(button === 0){
            this.mouse.left = false;
        }
    }
    private mousewheel(scroll: number){
        this.camera.zoom(Math.pow(1.01, -scroll), this.mouse.x, this.mouse.y);
        this.invalidateCanvas();
    }
    private callListeners(type: "hover" | "mouseover" | "pointerdown" | "pointerup", point: {x: number, y: number}){
        this.targets.forEach(target=>target.callEventListener(type, point));
    }
}