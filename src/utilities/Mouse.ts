import { Point } from "./Trig";

export class Mouse {
    private readonly _element: HTMLElement;
    private readonly _viewScale: number;
    private _mouseLocation = new Point(0, 0);

    public constructor(element: HTMLElement, viewScale: number) {
        this._element = element;
        this._viewScale = viewScale;
        this.hook();
    }

    private hook() {
        this._element.addEventListener("mousemove", event => this.handleMouseMove(event));
    }

    private handleMouseMove(event: MouseEvent) {
        let x = Math.floor((event.pageX - this._element.offsetLeft) / this._viewScale);
        let y = Math.floor((event.pageY - this._element.offsetTop) / this._viewScale);

        this._mouseLocation = new Point(x, y);
    }

    public get Location(): Point {
        return this._mouseLocation;
    }
}