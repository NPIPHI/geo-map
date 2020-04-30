export declare class camera extends Float32Array {
    static getView(x: number, y: number, scaleX: number, scaleY: number): Float32Array;
    static setAespectRatio(width: number, height: number): void;
    static toWorldSpace(x: number, y: number, cam: {
        x: number;
        y: number;
        scaleX: number;
        scaleY: number;
    }, canvas: HTMLCanvasElement): {
        x: number;
        y: number;
    };
}
