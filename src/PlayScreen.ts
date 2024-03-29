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
import { Point, Rectangle, Vector } from "./utilities/Trig";
import { createApple, createBeerCan, createChicken, createPlayer, createEnemy, createShoppingCart, createToiletPaper, createFallingBox, createBoss, createDuck, createRamEnemy, createBanana } from "./game/ecs/EntityFactory";
import { randomArrayElement, randomInt } from "./utilities/Random";
import * as Events from "./Events/Events";
import { BaseScenario, GameStart, FirstEnemyKilled, DirkSpawned } from "./Scenarios/GameStart";
import { GameOver } from "./Scenarios/GameStart";
import { AudioComponent } from "./game/ecs/components/AudioComponent";
import { Direction } from "./game/ecs/components/RenderComponent";
import { EntityId } from "./game/ecs/EntityComponentSystem";

enum GameState {
    Preparing,
    Defending,
    Lost
}

type EnemyFactory = (game: Game, location: Point) => EntityId;

class EnemyFactoryWithWeight {
    constructor(public factory: EnemyFactory, public weight: number) {

    }
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
        this._game.messageBus.subscribe(Events.Events.DirkHit, (eventArgs: Events.DirkHitEventArgs) => new Audio("gfx/hit" + eventArgs.dirkHitType + ".mp3").play());
        this._game.messageBus.subscribe(Events.Events.DirkDeath, (eventArgs: Events.DirkHitEventArgs) => new Audio("gfx/dirkdeath" + eventArgs.dirkHitType + ".mp3").play());
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

    private isAreaClear(area: Rectangle): boolean {
        for (let barrier of this._game.state.ecs.components.barrierComponents.all) {
            const dimensions = this._game.state.ecs.components.dimensionsComponents.get(barrier.entityId);

            if (area.overlaps(dimensions.bounds)) {
                return false;
            }
        }

        return true;
    }

    private randomLocation(): Point {
        let location: Point;
        do {
            location = new Point(randomInt(0, this._game.view.size.width), randomInt(0, this._game.view.size.height - 50));
        } while (!this.isAreaClear(new Rectangle(location.x - 20, location.y - 20, 40, 40)));

        return location;
    }

    handleEnemyKilled() {
        if (this._firstBlood) {
            this._activeScenario = new FirstEnemyKilled();
            this._firstBlood = false;
        }
        var sound = randomInt(0, 3);
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
                    this.drawLabelOverlay(renderContext, message);
                }
                break;

            case GameState.Defending:
                if (this._game.time.currentTime - this._stateEnterTime < 2000) {
                    this.drawLabelOverlay(renderContext, `Wave ${this._waveNumber}`);
                }
                break;

            case GameState.Lost:
                this._activeScenario = new GameOver();
                break;
        }

        this._ui.frameDone();
    }

    private drawLabelOverlay(renderContext: CanvasRenderingContext2D, message: string) {
        const size = this._game.fonts.medium.calculateSize(message);
        let centerLocation = new Point(this._game.view.size.width / 2, this._game.view.size.height / 2);
        let location = new Point(
            Math.round(centerLocation.x - size.width / 2),
            Math.round(centerLocation.y - size.height / 2));

        renderContext.fillStyle = "#000000AA";
        renderContext.fillRect(location.x - 5, location.y - 4, size.width + 10, size.height + 8);

        this._game.fonts.medium.render(renderContext, location, message);
    }

    private resetGame() {
        let gameState = this._game.state;

        this.switchState(GameState.Defending);
        this._waveNumber = 3;
        gameState.ecs.clear();
        gameState.score.reset();
        this._game.level.addWallsAndStatics('solids', gameState.ecs);
        // this._game.level.addWallsAndStatics('solids', gameState.ecs, this._game.images);

        this.spawnBoxes();
        this.spawnPaper();

        gameState.playerId = createPlayer(this._game, new Point(200, 225));
        this.spawnWave();
    }

    private spawnWave() {
        const spawnArea = new Rectangle(
            this._game.view.size.width - 50, 100,
            30, this._game.view.size.height - 200
        );

        this._waveNumber++;

        let num_zombies = 4 * this._waveNumber;
        if (this._waveNumber % 5 === 0) {
            num_zombies /= 2;
            for (let i = 0; i < this._waveNumber / 5; i++) {
                createBoss(this._game, this.randomLocationInArea(spawnArea));
            }
        }

        if (this._waveNumber % 5 == 0) {
            console.log("Hallo!");
            new Audio("gfx/dirklaugh.mp3").play();
            setTimeout(() => {
                var dirkenterType = randomInt(0, 3);
                new Audio("gfx/dirkenters" + dirkenterType + ".mp3").play();
            }, 3000);
        }
        if (this._waveNumber == 5) {
            this._activeScenario = new DirkSpawned();
        }

        for (let i = 0; i < num_zombies; i++) {
            const spawner = this.getRandomEnemyFactory();
            spawner(this._game, this.randomLocationInArea(spawnArea));
        }
    }

    private randomLocationInArea(area: Rectangle): Point {
        return new Point(
            randomInt(area.x, area.x + area.width),
            randomInt(area.y, area.y + area.height)
        );
    }

    private getRandomEnemyFactory(): EnemyFactory {
        const availableFactories = this.getAvailableEnemyFactories();
        const totalWeight = availableFactories.map(f => f.weight).reduce((v1, v2) => v1 + v2);
        const random = randomInt(0, totalWeight);
        let accumulator = 0;

        for (let factory of availableFactories) {
            accumulator += factory.weight;

            if (random < accumulator) {
                return factory.factory;
            }
        }

        return availableFactories[availableFactories.length - 1].factory;
    }

    private getAvailableEnemyFactories(): Array<EnemyFactoryWithWeight> {
        const factories = [
            new EnemyFactoryWithWeight(createEnemy, 100)
        ];

        if (this._waveNumber > 5) {
            const chance = Math.min(this._waveNumber * 2, 30);
            factories.push(new EnemyFactoryWithWeight(createRamEnemy, chance));
        }

        return factories;
    }

    spawnPaper() {
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 5; y++) {
                let location = new Point((x * 30) + 80, y * 30 + 150);

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
            if (this._game.input.wasButtonPressedInFrame(Keys.Use) || this._game.input.wasButtonPressedInFrame(Keys.Fire)) {
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
            this._game.state.ecs.components.movingRenderComponents.get(this._game.state.playerId).setDirection(Direction.Left);
        }
        if (this._game.input.isButtonDown(Keys.MoveRight)) {
            velocity = velocity.add(new Vector(time.calculateMovement(speed), 0));
            this._game.state.ecs.components.movingRenderComponents.get(this._game.state.playerId).setDirection(Direction.Right);
        }
        if (this._game.input.isButtonDown(Keys.MoveUp)) {
            velocity = velocity.add(new Vector(0, -time.calculateMovement(speed)));
            this._game.state.ecs.components.movingRenderComponents.get(this._game.state.playerId).setDirection(Direction.Up);
        }
        if (this._game.input.isButtonDown(Keys.MoveDown)) {
            velocity = velocity.add(new Vector(0, time.calculateMovement(speed)));
            this._game.state.ecs.components.movingRenderComponents.get(this._game.state.playerId).setDirection(Direction.Down);
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
                createApple, createBeerCan, createChicken, createDuck, createBanana
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
