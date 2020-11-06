import { FrameTime } from "./utilities/FrameTime";
import { IScreen } from "./utilities/ScreenManager";
import { Timer } from "./utilities/Timer";
import { DomUiEventProvider, Ui } from "./utilities/Ui";
import * as RenderSystem from "./game/ecs/systems/RenderSystem";
import * as ProjectileSystem from "./game/ecs/systems/ProjectileSystem";
import * as EntityCleanupSystem from "./game/ecs/systems/EntityCleanupSystem"
import * as TimedDestroySystem from "./game/ecs/systems/TimedDestroySystem"
import * as AISystem from "./game/ecs/systems/AISystem"
import { Game } from ".";
import { Keys } from "./utilities/InputProvider";
import { Point, Vector } from "./utilities/Trig";
import { createApple, createBeerCan, createChicken, createPlayer, createEnemy, createShoppingCart, createToiletPaper } from "./game/ecs/EntityFactory";
import { randomArrayElement } from "./utilities/Random";

export class PlayScreen implements IScreen {
    private readonly _game: Game;
    private readonly _ui = new Ui();
    private readonly _uiInputProvider;

    private _pause = false;
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

        if (this._pause) {
            return;
        }

        ProjectileSystem.update(this._game);
        AISystem.update(this._game);
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

        for (let x = 0; x < blocksX; x++) {
            for (let y = 0; y < blocksY; y++) {
                renderContext.drawImage(image, x * image.width, y * image.height);
            }
        }
    }

    private resetGame() {
        let gameState = this._game.state;

        gameState.ecs.clear();
        gameState.score.reset();
        this.spawnPaper();

        createShoppingCart(this._game, new Point(50, 200));
        createShoppingCart(this._game, new Point(300, 100));

        gameState.playerId = createPlayer(this._game, new Point(100, 100));
        gameState.enemies.push(createEnemy(this._game, new Point(200, 100)));
        gameState.enemies.push(createEnemy(this._game, new Point(200, 200)));
        gameState.enemies.push(createEnemy(this._game, new Point(200, 300)));
    }

    spawnPaper() {
        for (let x = 0; x < 5; x++) {
            for (let y = 0; y < 3; y++) {
                let location = new Point((x * 30) + 150, y * 30);

                createToiletPaper(this._game, location);
            }
        }
    }

    private handleInput(time: FrameTime) {
        const player = this._game.state.ecs.components.dimensionsComponents.get(this._game.state.playerId);

        if (this._game.input.wasButtonPressedInFrame(Keys.Pause)) {
            this._pause = !this._pause;
        }

        // ignore movement input when the game is paused.
        if (this._pause) {
            return;
        }

        let velocity = Vector.zero;
        if (this._game.input.isButtonDown(Keys.MoveLeft)) {
            velocity = velocity.add(new Vector(-time.calculateMovement(this._playerSpeed), 0));
        }
        if (this._game.input.isButtonDown(Keys.MoveRight)) {
            velocity = velocity.add(new Vector(time.calculateMovement(this._playerSpeed), 0));
        }
        if (this._game.input.isButtonDown(Keys.MoveUp)) {
            velocity = velocity.add(new Vector(0, -time.calculateMovement(this._playerSpeed)));
        }
        if (this._game.input.isButtonDown(Keys.MoveDown)) {
            velocity = velocity.add(new Vector(0, time.calculateMovement(this._playerSpeed)));
        }

        if (AISystem.canMove(this._game.state, this._game.state.playerId, velocity)) {
            player.bounds.location = player.bounds.location.add(velocity);
        }

        if ((this._game.input.isButtonDown(Keys.Fire) || this._game.mouse.Button1Down) && this._fireTimer.update(time.currentTime)) {
            let vector = this._game.mouse.Location.toVector().subtract(player.centerLocation.toVector());
            vector = vector.toUnit().multiplyScalar(200);

            let spawners = [
                createApple, createBeerCan, createChicken
            ];

            var spawner = randomArrayElement(spawners);
            spawner(this._game, player.centerLocation, vector);
        }
    }

    private checkPlayerDestroyed() {
        const dimensions = this._game.state.ecs.components.dimensionsComponents.get(this._game.state.playerId);

        if (dimensions == undefined) {
            this.resetGame();
        }
    }
}
