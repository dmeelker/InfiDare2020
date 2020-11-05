import { Game } from ".";
import { FrameTime } from "./utilities/FrameTime";
import { IScreen } from "./utilities/ScreenManager";
import { Point, Rectangle } from "./utilities/Trig";
import { DomUiEventProvider, Ui } from "./utilities/Ui";

export class IntroScreen implements IScreen {
    private readonly _game: Game;
    private readonly _ui = new Ui();
    private readonly _uiInputProvider;

    public constructor(game: Game) {
        this._game = game;
        this._uiInputProvider = new DomUiEventProvider(this._ui, game.view.canvas, game.view.scale);

        this._ui.defaultFont = game.fonts.small;
    }

    onActivate(): void {
        this._uiInputProvider.hook();
    }

    onDeactivate(): void {
        this._uiInputProvider.unhook();
    }

    update(time: FrameTime): void {
        
    }

    render(renderContext: CanvasRenderingContext2D): void {
        this._game.fonts.medium.render(renderContext, new Point(100, 100), "INTRO!");

        if(this._ui.textButton(renderContext, new Rectangle(10, 10, 200, 40), "Play!")) {
            this._game.screenManager.activateScreen(this._game.playScreen);
        }

        this._ui.frameDone();   
    }
}