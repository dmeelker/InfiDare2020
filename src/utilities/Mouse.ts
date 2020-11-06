import { Point } from "./Trig";

export class Mouse {
    private readonly _element: HTMLElement;
    private readonly _viewScale: number;
    private _mouseLocation = new Point(0, 0);
    private _mouseButton1Down = false;
    private _mouseButton2Down = false;

    public constructor(element: HTMLElement, viewScale: number) {
        this._element = element;
        this._viewScale = viewScale;
        this.hook();
    }

    private hook() {
        this._element.addEventListener("mousemove", event => this.handleMouseMove(event));
        this._element.addEventListener("mousedown", event => this.handleMouseDown(event));
        this._element.addEventListener("mouseup", event => this.handleMouseUp(event));
    }

    private handleMouseMove(event: MouseEvent) {
        let x = Math.floor((event.pageX - this._element.offsetLeft) / this._viewScale);
        let y = Math.floor((event.pageY - this._element.offsetTop) / this._viewScale);

        this._mouseLocation = new Point(x, y);
    }

    private handleMouseDown(event: MouseEvent): any {
        switch(event.button) {
            case 0:
                this._mouseButton1Down = true;
                break;
            case 1:
                this._mouseButton2Down = true;
                break;
        }
    }

    private handleMouseUp(event: MouseEvent): any {
        switch(event.button) {
            case 0:
                this._mouseButton1Down = false;
                break;
            case 1:
                this._mouseButton2Down = false;
                break;
        }
    }

    public get Location(): Point {
        return this._mouseLocation;
    }

    public get Button1Down(): boolean {
        return this._mouseButton1Down;
    }

    public get Button2Down(): boolean {
        return this._mouseButton2Down;
    }
}