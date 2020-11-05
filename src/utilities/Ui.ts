import { Font } from "./Font";
import { Point, Rectangle } from "./Trig";

class MouseState {
    public x: number;
    public y: number;
    public buttonDown: boolean = false;

    public clone(): MouseState {
        var clone = new MouseState();
        clone.x = this.x;
        clone.y = this.y;
        clone.buttonDown = this.buttonDown;
        return clone;
    }
}

type MouseEventHandler = (event: MouseEvent) => void;

export class DomUiEventProvider {
    private readonly _element: HTMLElement;
    private readonly _ui: Ui;
    private readonly _viewScale: number;

    private _mouseMoveHandler: MouseEventHandler;
    private _mouseDownHandler: MouseEventHandler;
    private _mouseUpHandler: MouseEventHandler;
    
    constructor(ui: Ui, element: HTMLElement, viewScale: number) {
        this._ui = ui;
        this._element = element;
        this._viewScale = viewScale;

        this._mouseMoveHandler = event => {
            let x = Math.floor((event.pageX - element.offsetLeft) / this._viewScale);
            let y = Math.floor((event.pageY - element.offsetTop) / this._viewScale);
    
            this._ui.mouseMove(x, y);
        };

        this._mouseDownHandler = event => {
            this._ui.mouseDown();
        };

        this._mouseUpHandler = event => {
            this._ui.mouseUp();
        };
    }

    public hook() {
        this._element.addEventListener("mousemove", this._mouseMoveHandler);
        this._element.addEventListener("mousedown", this._mouseDownHandler);
        this._element.addEventListener("mouseup", this._mouseUpHandler);
    }

    public unhook() {
        this._element.removeEventListener("mousemove", this._mouseMoveHandler);
        this._element.removeEventListener("mousedown", this._mouseDownHandler);
        this._element.removeEventListener("mouseup", this._mouseUpHandler);
    }
}

export class Ui {
    private _currentMouseState = new MouseState();
    private _previousMouseState = new MouseState();
    public defaultFont: Font;

    public mouseMove(x: number, y: number) {
        this._currentMouseState.x = x;
        this._currentMouseState.y = y;
    }

    public mouseDown() {
        this._currentMouseState.buttonDown = true;
    }

    public mouseUp() {
        this._currentMouseState.buttonDown = false;
    }

    public frameDone() {
        this._previousMouseState = this._currentMouseState;
        this._currentMouseState = this._previousMouseState.clone();
    }

    public textButton(context: CanvasRenderingContext2D, rectangle: Rectangle, text: string): boolean {
        context.beginPath();
        context.fillStyle = this.mouseHoverIn(rectangle) ? "green" : "red";
        context.fillRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);

        if(this.defaultFont) {
            const center = rectangle.center;
            let stringSize = this.defaultFont.calculateSize(text);
            this.defaultFont.render(context, new Point(center.x - (stringSize.width / 2), center.y - (stringSize.height / 2)), text);
        }

        return this.button(rectangle);
    }

    private button(rectangle: Rectangle): boolean {
        return this.mouseClickedIn(rectangle);
    }

    private mouseHoverIn(rectangle: Rectangle): boolean {
        return rectangle.containsPoint(new Point(this._currentMouseState.x, this._currentMouseState.y));
    }

    private mouseClickedIn(rectangle: Rectangle): boolean {
        return this.mouseHoverIn(rectangle) && this._previousMouseState.buttonDown && !this._currentMouseState.buttonDown;
    }
}
