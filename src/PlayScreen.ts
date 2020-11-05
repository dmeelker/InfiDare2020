import { createAsteroid, createPlayerShip, createProjectile } from "./game/ecs/EntityFactory";
import { EnemyGenerator } from "./game/EnemyGenerator";
import { StarField } from "./game/StarField";
import { FrameTime } from "./utilities/FrameTime";
import { IScreen } from "./utilities/ScreenManager";
import { Timer } from "./utilities/Timer";
import { Point, Vector } from "./utilities/Trig";
import { DomUiEventProvider, Ui } from "./utilities/Ui";
import * as RenderSystem from "./game/ecs/systems/RenderSystem";
import * as MovementSystem from "./game/ecs/systems/MovementSystem";
import * as ProjectileSystem from "./game/ecs/systems/ProjectileSystem";
import * as ShipControllerSystem from "./game/ecs/systems/ShipControllerSystem";
import * as EntityCleanupSystem from "./game/ecs/systems/EntityCleanupSystem"
import * as TimedDestroySystem from "./game/ecs/systems/TimedDestroySystem"
import * as SeekingTargetSystem from "./game/ecs/systems/SeekingTargetSystem"
import { ProjectileType } from "./game/ecs/components/ProjectileComponent";
import { Game } from ".";
import { Keys } from "./utilities/InputProvider";

export class PlayScreen implements IScreen {
    private readonly _game: Game;
    private readonly _ui = new Ui();
    private readonly _uiInputProvider;

    private _enemyGenerator: EnemyGenerator;
    private _starFields : Array<StarField>;

    private _shipSpeed = 200;
    private _fireTimer = new Timer(200);

    public constructor(game: Game) {
        this._game = game;
        this._uiInputProvider = new DomUiEventProvider(this._ui, game.view.canvas, game.view.scale);

        this._starFields = [
            new StarField(game.view.size.size, 20, 1300), 
            new StarField(game.view.size.size, 25, 1300), 
            new StarField(game.view.size.size, 30, 1300)];
    }

    onActivate(): void {
        this._uiInputProvider.hook();
        this.resetGame();
    }

    onDeactivate(): void {
        this._uiInputProvider.unhook();
    }

    update(time: FrameTime): void {
        this._starFields.forEach(field => field.update(time));

        this.handleInput(time);

        this._enemyGenerator.update(this._game);
        ShipControllerSystem.update(this._game);
        MovementSystem.update(this._game);
        ProjectileSystem.update(this._game);
        SeekingTargetSystem.update(this._game);
        TimedDestroySystem.update(this._game);
        EntityCleanupSystem.update(this._game);
        this._game.state.ecs.removeDisposedEntities();

        this.checkPlayerDestroyed();
    }

    render(renderContext: CanvasRenderingContext2D): void {
        this._starFields.forEach(field => field.render(renderContext));
        RenderSystem.render(this._game.state.ecs, renderContext);
    
        const ship = this._game.state.ecs.components.projectileTargetComponents.get(this._game.state.playerId);
        this._game.fonts.small.render(renderContext, new Point(5, this._game.view.size.size.height - this._game.fonts.small.LineHeight - 5),  `HP: ${ship.hitpoints.toString()} Score: ${this._game.state.score.points}`);

        this._ui.frameDone();   
    }

    private resetGame() {
        let gameState = this._game.state;

        gameState.ecs.clear();
        gameState.score.reset();
        this._enemyGenerator = new EnemyGenerator();
        gameState.playerId = createPlayerShip(this._game, this._game.view.levelToScreenCoordinates(new Point(5, 50)));
    
        createAsteroid(this._game, this._game.view.levelToScreenCoordinates(new Point(100, 50)));
    }

    private handleInput(time: FrameTime) {
        const dimensions = this._game.state.ecs.components.dimensionsComponents.get(this._game.state.playerId);
        let location = dimensions.bounds.location;
    
        if (this._game.input.isButtonDown(Keys.MoveLeft)) {
            location.x -= time.calculateMovement(this._shipSpeed);
        }
        if (this._game.input.isButtonDown(Keys.MoveRight)) {
            location.x += time.calculateMovement(this._shipSpeed);
        }
        if (this._game.input.isButtonDown(Keys.MoveUp)) {
            location.y -= time.calculateMovement(this._shipSpeed);
        }
        if (this._game.input.isButtonDown(Keys.MoveDown)) {
            location.y += time.calculateMovement(this._shipSpeed);
        }
    
        if(location.x < 0) location.x = 0;
        if(location.x + dimensions.bounds.size.width > this._game.view.size.size.width) location.x = this._game.view.size.size.width - dimensions.bounds.size.width;
        if(location.y < 0) location.y = 0;
        if(location.y + dimensions.bounds.size.height > this._game.view.size.size.height) location.y = this._game.view.size.size.height - dimensions.bounds.size.height;
    
        if(this._game.input.isButtonDown(Keys.Fire) && this._fireTimer.update(time.currentTime)) {
            const tankBounds = this._game.state.ecs.components.dimensionsComponents.get(this._game.state.playerId).bounds;
    
            //createProjectile(context.ecs, context.images, tankBounds.location, Vector.fromDegreeAngle(-25).multiplyScalar(500), ProjectileType.player);
            createProjectile(this._game, tankBounds.location, Vector.fromDegreeAngle(0).multiplyScalar(500), ProjectileType.player);
            //createProjectile(context.ecs, context.images, tankBounds.location, Vector.fromDegreeAngle(25).multiplyScalar(500), ProjectileType.player);
        }
    }

    private checkPlayerDestroyed() {
        const dimensions = this._game.state.ecs.components.dimensionsComponents.get(this._game.state.playerId);
    
        if(dimensions == undefined) {
            this.resetGame();
        }
    }
}