import { Game } from "../..";
import { Point, Rectangle, Vector } from "../../utilities/Trig";
import { DimensionsComponent } from "./components/DimensionsComponent";
import { RenderComponent, StaticImageProvider, MovingRenderComponent, Direction } from "./components/RenderComponent";
import { ProjectileComponent } from "./components/ProjectileComponent";
import { EntityId } from "./EntityComponentSystem";
import { CarryableComponent } from "./components/CarryableComponent";
import { LivingComponent } from "./components/LivingComponent";
import { EnemyBehaviour, EnemyComponent } from "./components/EnemyComponent";
import { EnemyTargetComponent } from "./components/EnemyTargetComponent";
import { AudioComponent } from "./components/AudioComponent";
import { FallingObjectComponent } from "./components/FallingObjectComponent";
import { randomInt } from "../../utilities/Random";
import { BarrierComponent } from "./components/BarrierComponent";

const PLAYER_HEALTH: number = 100;
const ENEMY_HEALTH: number = 4;

export function createPlayer(game: Game, location: Point,): EntityId {
    const entityId = game.state.ecs.allocateEntityId();
    var images = new Map<Direction, ImageBitmap>();
    images.set(Direction.Up, game.images.get("playerup"));
    images.set(Direction.Down, game.images.get("playerdown"));
    images.set(Direction.Right, game.images.get("playerright"));
    images.set(Direction.Left, game.images.get("playerleft"));

    var boundbox = images.get(Direction.Left);
    const dimensions = new LivingComponent(entityId, new Rectangle(location.x, location.y, boundbox.width as number, boundbox.height as number), PLAYER_HEALTH);

    game.state.ecs.components.dimensionsComponents.add(dimensions);
    game.state.ecs.components.movingRenderComponents.add(new MovingRenderComponent(entityId, images));
    return entityId;
}

export function createEnemy(game: Game, location: Point): EntityId {
    const entityId = game.state.ecs.allocateEntityId();
    var zombieType = "zombie" + randomInt(0, 3);
    var image = game.images.get(zombieType);

    const dimensions = new LivingComponent(entityId, new Rectangle(location.x, location.y, image.width, image.height), ENEMY_HEALTH);
    dimensions.hasCollision = false;

    game.state.ecs.components.dimensionsComponents.add(dimensions);
    game.state.ecs.components.renderComponents.add(new RenderComponent(entityId, new StaticImageProvider(image)));
    game.state.ecs.components.enemyComponents.add(new EnemyComponent(entityId, EnemyBehaviour.Normal));

    return entityId;
}

export function createRamEnemy(game: Game, location: Point): EntityId {
    const entityId = game.state.ecs.allocateEntityId();
    var image = game.images.get("ramzombie");

    const dimensions = new LivingComponent(entityId, new Rectangle(location.x, location.y, image.width, image.height), ENEMY_HEALTH);
    dimensions.hasCollision = false;

    game.state.ecs.components.dimensionsComponents.add(dimensions);
    game.state.ecs.components.renderComponents.add(new RenderComponent(entityId, new StaticImageProvider(image)));

    const enemy = new EnemyComponent(entityId, EnemyBehaviour.Ram);
    enemy.ramForce = 10;
    game.state.ecs.components.enemyComponents.add(enemy);

    return entityId;
}

export function createBoss(game: Game, location: Point): EntityId {
    const entityId = game.state.ecs.allocateEntityId();
    var image = game.images.get("boss");

    const dimensions = new LivingComponent(entityId, new Rectangle(location.x, location.y, image.width, image.height), ENEMY_HEALTH * 5);
    dimensions.hasCollision = false;

    game.state.ecs.components.dimensionsComponents.add(dimensions);
    game.state.ecs.components.renderComponents.add(new RenderComponent(entityId, new StaticImageProvider(image)));
    game.state.ecs.components.enemyComponents.add(new EnemyComponent(entityId, EnemyBehaviour.Spawner));

    return entityId;
}


export function createApple(game: Game, location: Point, vector: Vector) {
    const entityId = game.state.ecs.allocateEntityId();
    const image = game.images.get("apple");

    const dimensions = new DimensionsComponent(entityId, new Rectangle(location.x - (image.width / 2), location.y - (image.height / 2), image.width, image.height), false);
    dimensions.center = new Point(image.width / 2, image.height / 2);

    game.state.ecs.components.dimensionsComponents.add(dimensions);
    game.state.ecs.components.renderComponents.add(new RenderComponent(entityId, new StaticImageProvider(image)));
    game.state.ecs.components.projectileComponents.add(new ProjectileComponent(entityId, vector, game.time.currentTime, 1, 1));
    game.state.ecs.components.audioComponents.add(new AudioComponent(entityId, "gunshot.mp3", false));

    return entityId;
}

export function createBeerCan(game: Game, location: Point, vector: Vector) {
    const entityId = game.state.ecs.allocateEntityId();
    const image = game.images.get("beercan");

    const dimensions = new DimensionsComponent(entityId, new Rectangle(location.x - (image.width / 2), location.y - (image.height / 2), image.width, image.height), false);
    dimensions.center = new Point(image.width / 2, image.height / 2);

    game.state.ecs.components.dimensionsComponents.add(dimensions);
    game.state.ecs.components.renderComponents.add(new RenderComponent(entityId, new StaticImageProvider(image)));
    game.state.ecs.components.projectileComponents.add(new ProjectileComponent(entityId, vector, game.time.currentTime, .7, 2));
    game.state.ecs.components.audioComponents.add(new AudioComponent(entityId, "beer.mp3", false));

    return entityId;
}

export function createChicken(game: Game, location: Point, vector: Vector) {
    const entityId = game.state.ecs.allocateEntityId();
    const image = game.images.get("chicken");

    const dimensions = new DimensionsComponent(entityId, new Rectangle(location.x - (image.width / 2), location.y - (image.height / 2), image.width, image.height), false);
    dimensions.center = new Point(image.width / 2, image.height / 2);

    game.state.ecs.components.dimensionsComponents.add(dimensions);
    game.state.ecs.components.renderComponents.add(new RenderComponent(entityId, new StaticImageProvider(image)));
    game.state.ecs.components.projectileComponents.add(new ProjectileComponent(entityId, vector, game.time.currentTime, .4, 3));
    game.state.ecs.components.audioComponents.add(new AudioComponent(entityId, "chicken.mp3", false));

    return entityId;
}

export function createDuck(game: Game, location: Point, vector: Vector) {
    const entityId = game.state.ecs.allocateEntityId();
    const image = game.images.get("ducky");

    const dimensions = new DimensionsComponent(entityId, new Rectangle(location.x - (image.width / 2), location.y - (image.height / 2), image.width, image.height), false);
    dimensions.center = new Point(image.width / 2, image.height / 2);

    game.state.ecs.components.dimensionsComponents.add(dimensions);
    game.state.ecs.components.renderComponents.add(new RenderComponent(entityId, new StaticImageProvider(image)));
    game.state.ecs.components.projectileComponents.add(new ProjectileComponent(entityId, vector, game.time.currentTime, .4, 1));

    return entityId;
}

export function createBanana(game: Game, location: Point, vector: Vector) {
    const entityId = game.state.ecs.allocateEntityId();
    const image = game.images.get("banana");

    const dimensions = new DimensionsComponent(entityId, new Rectangle(location.x - (image.width / 2), location.y - (image.height / 2), image.width, image.height), false);
    dimensions.center = new Point(image.width / 2, image.height / 2);

    game.state.ecs.components.dimensionsComponents.add(dimensions);
    game.state.ecs.components.renderComponents.add(new RenderComponent(entityId, new StaticImageProvider(image)));
    game.state.ecs.components.projectileComponents.add(new ProjectileComponent(entityId, vector, game.time.currentTime, .4, 2));

    return entityId;
}

export function createToiletPaper(game: Game, location: Point) {
    const entityId = game.state.ecs.allocateEntityId();
    const image = game.images.get("toiletpaper");

    const dimensions = new DimensionsComponent(entityId, new Rectangle(location.x - (image.width / 2), location.y - (image.height / 2), image.width, image.height));
    dimensions.hasCollision = false;

    game.state.ecs.components.dimensionsComponents.add(dimensions);
    game.state.ecs.components.renderComponents.add(new RenderComponent(entityId, new StaticImageProvider(image)));
    game.state.ecs.components.carryableComponents.add(new CarryableComponent(entityId));
    game.state.ecs.components.enemyTargetComponents.add(new EnemyTargetComponent(entityId));

    return entityId;
}

export function createShoppingCart(game: Game, location: Point) {
    const entityId = game.state.ecs.allocateEntityId();
    const image = game.images.get("shoppingcart");

    const dimensions = new DimensionsComponent(entityId, new Rectangle(location.x - (image.width / 2), location.y - (image.height / 2), image.width, image.height), true);

    game.state.ecs.components.dimensionsComponents.add(dimensions);
    game.state.ecs.components.renderComponents.add(new RenderComponent(entityId, new StaticImageProvider(image)));
    game.state.ecs.components.carryableComponents.add(new CarryableComponent(entityId));
    game.state.ecs.components.barrierComponents.add(new BarrierComponent(entityId, 50));

    return entityId;
}

export function createFallingBox(game: Game, location: Point) {
    const entityId = game.state.ecs.allocateEntityId();
    const image = game.images.get("box");
    const targetLocation = new Point(location.x + (image.width / 2), location.y + (image.height / 2));

    const dimensions = new DimensionsComponent(entityId, new Rectangle(location.x, location.y - 100, image.width, image.height), true);
    dimensions.hasCollision = false;

    game.state.ecs.components.dimensionsComponents.add(dimensions);
    game.state.ecs.components.renderComponents.add(new RenderComponent(entityId, new StaticImageProvider(image)));
    game.state.ecs.components.carryableComponents.add(new CarryableComponent(entityId));
    game.state.ecs.components.fallingObjectComponents.add(new FallingObjectComponent(entityId, targetLocation, 100));
    game.state.ecs.components.barrierComponents.add(new BarrierComponent(entityId, 5));

    return entityId;
}
