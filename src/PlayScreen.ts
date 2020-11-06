import { FrameTime } from "./utilities/FrameTime";
import { IScreen } from "./utilities/ScreenManager";
import { Timer } from "./utilities/Timer";
import { DomUiEventProvider, Ui } from "./utilities/Ui";
import * as RenderSystem from "./game/ecs/systems/RenderSystem";
import * as ProjectileSystem from "./game/ecs/systems/ProjectileSystem";
import * as EntityCleanupSystem from "./game/ecs/systems/EntityCleanupSystem";
import * as TimedDestroySystem from "./game/ecs/systems/TimedDestroySystem";
import * as AISystem from "./game/ecs/systems/AISystem";
import * as CarrierRenderSystem from "./game/ecs/systems/CarrierRenderSystem";
import * as AudioSystem from "./game/ecs/systems/AudioSystem";
import * as CarrierHelper from "./game/ecs/utilities/CarrierHelper"
import * as DialogSystem from "./game/ecs/systems/DialogSystem";
import * as FallingObjectSystem from "./game/ecs/systems/FallingObjectSystem";
import * as FallingObjectShadowRenderer from "./game/ecs/systems/FallingObjectShadowRenderer";
import { Game } from ".";
import { Keys } from "./utilities/InputProvider";
import { Point, Vector } from "./utilities/Trig";
import { createApple, createBeerCan, createChicken, createPlayer, createEnemy, createShoppingCart, createToiletPaper, createFallingBox } from "./game/ecs/EntityFactory";
import { randomArrayElement, randomInt } from "./utilities/Random";
import * as Events from "./Events/Events";
import { CarrierComponent } from "./game/ecs/components/CarrierComponent";
import { CarryableComponent } from "./game/ecs/components/CarryableComponent";
import { BaseScenario, GameStart, FirstEnemyKilled } from "./Scenarios/GameStart";
import { GameOver } from "./Scenarios/GameStart";
import { AudioComponent } from "./game/ecs/components/AudioComponent";

enum GameState {
    Preparing,
    Defending,
    Lost
}

export class PlayScreen implements IScreen {
    private readonly _game: Game;
    private readonly _ui = new Ui();
    private readonly _uiInputProvider;

    private _pause = false;
    private _firstBlood = true;
    private _playerSpeed = 70;
    private _playerRunSpeed = 130;
    private _fireTimer = new Timer(200);
    private _waveNumber = 0;
    private _state = GameState.Preparing;
    private _stateEnterTime = 0;
    private _prepareTime = 10000;
    private _lostTime = 5000;
    private _activeScenario: BaseScenario;

    public constructor(game: Game) {
        this._game = game;
        this._ui.defaultFont = this._game.fonts.medium;
        this._uiInputProvider = new DomUiEventProvider(this._ui, game.view.canvas, game.view.scale);
    }

    onActivate(): void {
        this._uiInputProvider.hook();
        this.resetGame();
        this._game.messageBus.subscribe(Events.Events.EnemyKilled, () => this.handleEnemyKilled());
        this._activeScenario = new GameStart();
    }

    onDeactivate(): void {
        this._uiInputProvider.unhook();
    }

    update(time: FrameTime): void {
        this.handleInput(time);

        if (this._pause || this._activeScenario != null) {
            return;
        }

        ProjectileSystem.update(this._game);
        FallingObjectSystem.update(this._game);
        AISystem.update(this._game);
        TimedDestroySystem.update(this._game);
        EntityCleanupSystem.update(this._game);
        this._game.state.ecs.removeDisposedEntities();

        this.checkPlayerDestroyed();

        switch (this._state) {
            case GameState.Preparing:
                if (time.currentTime - this._stateEnterTime >= this._prepareTime) {
                    this.spawnWave();
                    this.switchState(GameState.Defending);
                }
                break;

            case GameState.Defending:
                if (this.checkAllTargetsGone()) {
                    this.gameLost();
                }

                if (this._game.state.ecs.components.enemyComponents.count === 0) {
                    this.spawnBoxes();
                    this.switchState(GameState.Preparing);
                }
                break;

            case GameState.Lost:
                if (time.currentTime - this._stateEnterTime >= this._lostTime) {
                    this.resetGame();
                }
                break;
        }
    }
    private spawnBoxes() {
        const count = Math.min(this._waveNumber, 3);
        for (let i = 0; i < count; i++) {
            createFallingBox(this._game, this.randomLocation());
        }
    }

    private randomLocation(): Point {
        return new Point(randomInt(0, this._game.view.size.width), randomInt(0, this._game.view.size.height - 50));
    }

    handleEnemyKilled() {
        if (this._firstBlood) {
            this._activeScenario = new FirstEnemyKilled();
            this._firstBlood = false;
        }
        var sound = randomInt(0, 3);
        console.log(sound);
        this._game.state.ecs.components.audioComponents.add(new AudioComponent(this._game.state.ecs.allocateEntityId(), "zombiedeath" + sound + ".mp3"))
    }

    render(renderContext: CanvasRenderingContext2D): void {
        this._game.level.drawMap(this._game.view.context);
        FallingObjectShadowRenderer.render(this._game, renderContext);
        RenderSystem.render(this._game.state.ecs, renderContext);
        AudioSystem.render(this._game);
        CarrierRenderSystem.render(this._game, renderContext);

        if (this._activeScenario != null) {
            DialogSystem.render(this._activeScenario.current(), this._game, renderContext);
        }

        switch (this._state) {
            case GameState.Preparing:
                const timeLeft = (this._game.time.currentTime - this._stateEnterTime) / this._prepareTime;
                let message: string = null;

                if (timeLeft > .8) {
                    message = "Here they come!";
                } else if (timeLeft > .5) {
                    message = "Prepare yourself!";
                } else if (timeLeft < .2) {
                    message = "You got them all!";
                }

                if (message) {
                    this._game.fonts.medium.renderCentered(renderContext, new Point(this._game.view.size.width / 2, this._game.view.size.height / 2), message);
                }
                break;

            case GameState.Defending:
                if (this._game.time.currentTime - this._stateEnterTime < 2000) {
                    this._game.fonts.medium.renderCentered(renderContext, new Point(this._game.view.size.width / 2, this._game.view.size.height / 2), `Wave ${this._waveNumber}`);
                }
                break;

            case GameState.Lost:
                this._activeScenario = new GameOver();
                break;
        }

        this._ui.frameDone();
    }


    private resetGame() {
        let gameState = this._game.state;


        this.switchState(GameState.Defending);
        gameState.ecs.clear();
        gameState.score.reset();
        this.spawnBoxes();
        this.spawnPaper();

        createShoppingCart(this._game, new Point(50, 200));
        createShoppingCart(this._game, new Point(300, 100));

        gameState.playerId = createPlayer(this._game, new Point(100, 100));
        this.spawnWave();
    }

    spawnWave() {
        for (let i = 0; i < 2 * (this._waveNumber + 2); i++) {
            createEnemy(this._game, new Point(randomInt(1, 400), randomInt(200, 300)));
        }
        this._waveNumber++;
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

        if (this._activeScenario != null) {
            if (this._game.input.wasButtonPressedInFrame(Keys.Use)) {
                if (this._activeScenario.finished()) {
                    this._activeScenario = null;
                }
            }
        }

        // ignore movement input when the game is paused.
        if (this._pause || this._activeScenario != null) {
            return;
        }

        let velocity = Vector.zero;
        var speed = this._playerSpeed;
        if (this._game.input.isButtonDown(Keys.Sprint)) {
            speed = this._playerRunSpeed;
        }
        if (this._game.input.isButtonDown(Keys.MoveLeft)) {
            velocity = velocity.add(new Vector(-time.calculateMovement(speed), 0));
        }
        if (this._game.input.isButtonDown(Keys.MoveRight)) {
            velocity = velocity.add(new Vector(time.calculateMovement(speed), 0));
        }
        if (this._game.input.isButtonDown(Keys.MoveUp)) {
            velocity = velocity.add(new Vector(0, -time.calculateMovement(speed)));
        }
        if (this._game.input.isButtonDown(Keys.MoveDown)) {
            velocity = velocity.add(new Vector(0, time.calculateMovement(speed)));
        }

        if (!AISystem.collides(this._game.state, this._game.state.playerId, velocity)) {
            player.bounds.location = player.bounds.location.add(velocity);
        }

        if (this._game.input.wasButtonPressedInFrame(Keys.Use)) {
            this.interact();
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

    private interact() {
        const currentCarrier = this._game.state.ecs.components.carrierComponents.get(this._game.state.playerId);

        if (currentCarrier) {
            CarrierHelper.dropCarriedObject(this._game, this._game.state.playerId);
        } else {
            const carryable = CarrierHelper.findNearestCarryable(this._game, this._game.state.playerId);
            if (carryable) {
                CarrierHelper.carryObject(this._game, this._game.state.playerId, carryable.entityId);
            }
        }
    }

    private checkPlayerDestroyed() {
        const dimensions = this._game.state.ecs.components.dimensionsComponents.get(this._game.state.playerId);

        if (dimensions == undefined) {
            this.resetGame();
        }
    }

    private switchState(newState: GameState) {
        this._state = newState;
        this._stateEnterTime = this._game.time.currentTime;
    }

    private checkAllTargetsGone() {
        return this.noTargetsOnGround() && this.noTargetsCarried();
    }

    private noTargetsOnGround() {
        return this._game.state.ecs.components.enemyTargetComponents.count == 0;
    }

    private noTargetsCarried() {
        var carriers = this._game.state.ecs.components.carrierComponents.all;

        for (let carrier of carriers) {
            if (carrier.carriedEntityComponents.enemyTargetComponents.count > 0) {
                return false;
            }
        }

        return true;
    }

    private gameLost() {
        this.switchState(GameState.Lost);
    }
}
