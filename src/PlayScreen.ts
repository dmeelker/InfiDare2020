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
import { Point } from "./utilities/Trig";
import { createPlayer } from "./game/ecs/EntityFactory";

export class PlayScreen implements IScreen {
    private readonly _game: Game;
    private readonly _ui = new Ui();
    private readonly _uiInputProvider;

    private _playerSpeed = 80;
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
        this.drawFloor(renderContext);
        RenderSystem.render(this._game.state.ecs, renderContext);
        this._ui.frameDone();   
    }

    private drawFloor(renderContext: CanvasRenderingContext2D) {
        let image = this._game.images.get("floor1");
        const viewSize = this._game.view.size
        const blocksX = viewSize.width / image.width;
        const blocksY = viewSize.width / image.height;

        for(let x=0; x<blocksX; x++) {
            for(let y=0; y<blocksY; y++) {
                renderContext.drawImage(image, x * image.width, y * image.height);
            }   
        }
    }

    private resetGame() {
        let gameState = this._game.state;

        gameState.ecs.clear();
        gameState.score.reset();
        gameState.playerId = createPlayer(this._game, new Point(100, 100));
    }

    private handleInput(time: FrameTime) {
        const dimensions = this._game.state.ecs.components.dimensionsComponents.get(this._game.state.playerId);
        let location = dimensions.bounds.location;
    
        if (this._game.input.isButtonDown(Keys.MoveLeft)) {
            location.x -= time.calculateMovement(this._playerSpeed);
        }
        if (this._game.input.isButtonDown(Keys.MoveRight)) {
            location.x += time.calculateMovement(this._playerSpeed);
        }
        if (this._game.input.isButtonDown(Keys.MoveUp)) {
            location.y -= time.calculateMovement(this._playerSpeed);
        }
        if (this._game.input.isButtonDown(Keys.MoveDown)) {
            location.y += time.calculateMovement(this._playerSpeed);
        }
    }

    private checkPlayerDestroyed() {
        const dimensions = this._game.state.ecs.components.dimensionsComponents.get(this._game.state.playerId);
    
        if(dimensions == undefined) {
            this.resetGame();
        }
    }
}