import { FrameTime } from "./utilities/FrameTime";
import { IScreen } from "./utilities/ScreenManager";
import { Timer } from "./utilities/Timer";
import { DomUiEventProvider, Ui } from "./utilities/Ui";
import * as RenderSystem from "./game/ecs/systems/RenderSystem";
import * as MovementSystem from "./game/ecs/systems/MovementSystem";
import * as EntityCleanupSystem from "./game/ecs/systems/EntityCleanupSystem"
import * as TimedDestroySystem from "./game/ecs/systems/TimedDestroySystem"
import { Game } from ".";
import { Keys } from "./utilities/InputProvider";

export class PlayScreen implements IScreen {
    private readonly _game: Game;
    private readonly _ui = new Ui();
    private readonly _uiInputProvider;

    private _shipSpeed = 200;
    private _fireTimer = new Timer(200);

    public constructor(game: Game) {
        this._game = game;
        this._uiInputProvider = new DomUiEventProvider(this._ui, game.view.canvas, game.view.scale);
    }

    onActivate(): void {
        this._uiInputProvider.hook();
        this.resetGame();
    }

    onDeactivate(): void {
        this._uiInputProvider.unhook();
    }

    update(time: FrameTime): void {
        this.handleInput(time);

        MovementSystem.update(this._game);
        TimedDestroySystem.update(this._game);
        EntityCleanupSystem.update(this._game);
        this._game.state.ecs.removeDisposedEntities();

        this.checkPlayerDestroyed();
    }

    render(renderContext: CanvasRenderingContext2D): void {
        RenderSystem.render(this._game.state.ecs, renderContext);
        this._ui.frameDone();   
    }

    private resetGame() {
        let gameState = this._game.state;

        gameState.ecs.clear();
        gameState.score.reset();
    }

    private handleInput(time: FrameTime) {
        // const dimensions = this._game.state.ecs.components.dimensionsComponents.get(this._game.state.playerId);
        // let location = dimensions.bounds.location;
    
        // if (this._game.input.isButtonDown(Keys.MoveLeft)) {
        //     location.x -= time.calculateMovement(this._shipSpeed);
        // }
        // if (this._game.input.isButtonDown(Keys.MoveRight)) {
        //     location.x += time.calculateMovement(this._shipSpeed);
        // }
        // if (this._game.input.isButtonDown(Keys.MoveUp)) {
        //     location.y -= time.calculateMovement(this._shipSpeed);
        // }
        // if (this._game.input.isButtonDown(Keys.MoveDown)) {
        //     location.y += time.calculateMovement(this._shipSpeed);
        // }
    
        // if(location.x < 0) location.x = 0;
        // if(location.x + dimensions.bounds.size.width > this._game.view.size.size.width) location.x = this._game.view.size.size.width - dimensions.bounds.size.width;
        // if(location.y < 0) location.y = 0;
        // if(location.y + dimensions.bounds.size.height > this._game.view.size.size.height) location.y = this._game.view.size.size.height - dimensions.bounds.size.height;
    }

    private checkPlayerDestroyed() {
        const dimensions = this._game.state.ecs.components.dimensionsComponents.get(this._game.state.playerId);
    
        if(dimensions == undefined) {
            this.resetGame();
        }
    }
}