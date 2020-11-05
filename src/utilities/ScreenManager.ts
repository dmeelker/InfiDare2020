import { FrameTime } from "./FrameTime";

export interface IScreen {
    onActivate(): void;
    onDeactivate(): void;

    update(time: FrameTime): void;
    render(renderContext: CanvasRenderingContext2D): void;
}

export class ScreenManager {
    private _activeScreen: IScreen;

    public constructor(activeScreen: IScreen) {
        this.activateScreen(activeScreen);
    }

    public activateScreen(screen: IScreen) {
        console.log(`Activating ${screen}`)
        if (this._activeScreen) {
            this._activeScreen.onDeactivate();
        }

        this._activeScreen = screen;
        this._activeScreen.onActivate();
    }

    public update(time: FrameTime) {
        if (this._activeScreen) {
            this._activeScreen.update(time);
        }
    }

    public get activeScreen(): IScreen {
        return this._activeScreen;
    }
}