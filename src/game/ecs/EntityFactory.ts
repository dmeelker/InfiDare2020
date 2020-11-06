import { Game } from "../..";
import { Point, Rectangle, Vector } from "../../utilities/Trig";
import { DimensionsComponent } from "./components/DimensionsComponent";
import { RenderComponent, StaticImageProvider } from "./components/RenderComponent";
import { ProjectileComponent } from "./components/ProjectileComponent";
import { EntityId } from "./EntityComponentSystem";
import { CarryableComponent } from "./components/CarryableComponent";
import { LivingComponent } from "./components/LivingComponent";

const PLAYER_HEALTH: number = 100;
const ENEMY_HEALTH: number = 5;

export function createPlayer(game: Game, location: Point,): EntityId {
    const entityId = game.state.ecs.allocateEntityId();
    const image = game.images.get("player");

    const dimensions = new LivingComponent(entityId, new Rectangle(location.x, location.y, image.width, image.height), PLAYER_HEALTH);

    game.state.ecs.components.dimensionsComponents.add(dimensions);
    game.state.ecs.components.renderComponents.add(new RenderComponent(entityId, new StaticImageProvider(image)));

    return entityId;
}

export function createEnemy(game: Game, location: Point): EntityId {
    const entityId = game.state.ecs.allocateEntityId();
    const image = game.images.get("player");

    const dimensions = new LivingComponent(entityId, new Rectangle(location.x, location.y, image.width, image.height), ENEMY_HEALTH);

    game.state.ecs.components.dimensionsComponents.add(dimensions);
    game.state.ecs.components.renderComponents.add(new RenderComponent(entityId, new StaticImageProvider(image)));

    return entityId;
}

export function createApple(game: Game, location: Point, vector: Vector) {
    const entityId = game.state.ecs.allocateEntityId();
    const image = game.images.get("apple");

    const dimensions = new DimensionsComponent(entityId, new Rectangle(location.x - (image.width / 2), location.y - (image.height / 2), image.width, image.height));
    dimensions.center = new Point(image.width / 2, image.height / 2);

    game.state.ecs.components.dimensionsComponents.add(dimensions);
    game.state.ecs.components.renderComponents.add(new RenderComponent(entityId, new StaticImageProvider(image)));
    game.state.ecs.components.projectileComponents.add(new ProjectileComponent(entityId, vector, game.time.currentTime, 1));

    return entityId;
}

export function createBeerCan(game: Game, location: Point, vector: Vector) {
    const entityId = game.state.ecs.allocateEntityId();
    const image = game.images.get("beercan");

    const dimensions = new DimensionsComponent(entityId, new Rectangle(location.x - (image.width / 2), location.y - (image.height / 2), image.width, image.height));
    dimensions.center = new Point(image.width / 2, image.height / 2);

    game.state.ecs.components.dimensionsComponents.add(dimensions);
    game.state.ecs.components.renderComponents.add(new RenderComponent(entityId, new StaticImageProvider(image)));
    game.state.ecs.components.projectileComponents.add(new ProjectileComponent(entityId, vector, game.time.currentTime, .7));

    return entityId;
}

export function createChicken(game: Game, location: Point, vector: Vector) {
    const entityId = game.state.ecs.allocateEntityId();
    const image = game.images.get("chicken");

    const dimensions = new DimensionsComponent(entityId, new Rectangle(location.x - (image.width / 2), location.y - (image.height / 2), image.width, image.height));
    dimensions.center = new Point(image.width / 2, image.height / 2);

    game.state.ecs.components.dimensionsComponents.add(dimensions);
    game.state.ecs.components.renderComponents.add(new RenderComponent(entityId, new StaticImageProvider(image)));
    game.state.ecs.components.projectileComponents.add(new ProjectileComponent(entityId, vector, game.time.currentTime, .4));

    return entityId;
}

export function createToiletPaper(game: Game, location: Point) {
    const entityId = game.state.ecs.allocateEntityId();
    const image = game.images.get("toiletpaper");

    const dimensions = new DimensionsComponent(entityId, new Rectangle(location.x - (image.width / 2), location.y - (image.height / 2), image.width, image.height));

    game.state.ecs.components.dimensionsComponents.add(dimensions);
    game.state.ecs.components.renderComponents.add(new RenderComponent(entityId, new StaticImageProvider(image)));
    game.state.ecs.components.carryableComponents.add(new CarryableComponent(entityId));

    return entityId;
}

export function createShoppingCart(game: Game, location: Point) {
    const entityId = game.state.ecs.allocateEntityId();
    const image = game.images.get("shoppingcart");

    const dimensions = new DimensionsComponent(entityId, new Rectangle(location.x - (image.width / 2), location.y - (image.height / 2), image.width, image.height));

    game.state.ecs.components.dimensionsComponents.add(dimensions);
    game.state.ecs.components.renderComponents.add(new RenderComponent(entityId, new StaticImageProvider(image)));
    game.state.ecs.components.carryableComponents.add(new CarryableComponent(entityId));
    return entityId;
}
