import { Game } from "../..";
import { AnimationInstance } from "../../utilities/Animation";
import { Point, Rectangle, Vector } from "../../utilities/Trig";
import { ComputerControlledShipComponent, MovementMode } from "./components/ComputerControlledShipComponent";
import { DimensionsComponent } from "./components/DimensionsComponent";
import { ProjectileComponent, ProjectileType } from "./components/ProjectileComponent";
import { ProjectileTargetComponent } from "./components/ProjectileTargetComponent";
import { RenderComponent, StaticImageProvider } from "./components/RenderComponent";
import { TimedDestroyComponent } from "./components/TimedDestroyComponent";
import { VelocityComponent } from "./components/VelocityComponent";
import { EntityId } from "./EntityComponentSystem";

export function createPlayerShip(game: Game, location: Point,): EntityId {
    const entityId = game.state.ecs.allocateEntityId();
    const image = game.images.get("ship");

    const dimensions = new DimensionsComponent(entityId, new Rectangle(location.x, location.y, 12, 16));
    dimensions.center = new Point(image.width / 2, image.height / 2);

    game.state.ecs.components.dimensionsComponents.add(dimensions);
    game.state.ecs.components.renderComponents.add(new RenderComponent(entityId, new StaticImageProvider(image)));
    game.state.ecs.components.projectileTargetComponents.add(new ProjectileTargetComponent(entityId, 10, ProjectileType.player));

    return entityId;
}

export function createProjectile(game: Game, location: Point, vector: Vector, type: ProjectileType): EntityId {
    const image = game.images.get("shot");
    const entityId = game.state.ecs.allocateEntityId();

    const entityLocation = new Point(location.x - (image.width / 2), location.y - (image.height / 2));

    const dimensions = new DimensionsComponent(entityId, new Rectangle(entityLocation.x, entityLocation.y, image.width, image.height));
    dimensions.center = new Point(image.width / 2, image.height / 2);
    dimensions.rotationInDegrees = vector.angleInDegrees;
    
    game.state.ecs.components.dimensionsComponents.add(dimensions);
    game.state.ecs.components.renderComponents.add(new RenderComponent(entityId, new StaticImageProvider(image)));
    game.state.ecs.components.projectileComponents.add(new ProjectileComponent(entityId, 1, type));
    game.state.ecs.components.velocityComponents.add(new VelocityComponent(entityId, vector));
    
    // if(type == ProjectileType.enemy) {
    //     game.ecs.components.seekingTargetComponents.add(new SeekingTargetComponent(entityId, game.playerId));
    // } else {
    //}
    return entityId;
}

export function createExplosion(game: Game, location: Point) {
    const animation = game.animations.get("explosion");
    const firstFrame = animation.frames[0];
    const entityId = game.state.ecs.allocateEntityId();

    const dimensions = new DimensionsComponent(entityId, new Rectangle(location.x, location.y, firstFrame.width, firstFrame.height));
    dimensions.center = new Point(firstFrame.width / 2, firstFrame.height / 2);
    
    game.state.ecs.components.dimensionsComponents.add(dimensions);
    game.state.ecs.components.renderComponents.add(new RenderComponent(entityId, new AnimationInstance(animation)));
    game.state.ecs.components.timedDestroyComponents.add(new TimedDestroyComponent(entityId, game.time.currentTime + animation.duration));

    return entityId;
}

export interface IEnemyDescription {
    location: Point;
    vector: Vector;
    movementMode: MovementMode;
    path?: Array<Point>;
}

export function createShip(game: Game, enemy: IEnemyDescription): EntityId {
    // const location = {x: game.viewSize.size.width, y: game.viewSize.size.height * (enemy.y / 100)};
    // const angle = enemy.angle ?? 180;
    // const vector = Vector.fromDegreeAngle(angle).multiplyScalar(enemy.speed);

    const image = game.images.get("ship");
    const entityId = game.state.ecs.allocateEntityId();

    const dimensions = new DimensionsComponent(entityId, new Rectangle(enemy.location.x, enemy.location.y, image.width, image.height));
    dimensions.center = new Point(image.width / 2, image.height / 2);
    dimensions.rotationInDegrees = enemy.vector.angleInDegrees;
    
    game.state.ecs.components.dimensionsComponents.add(dimensions);
    game.state.ecs.components.renderComponents.add(new RenderComponent(entityId, new StaticImageProvider(image)));
    game.state.ecs.components.projectileTargetComponents.add(new ProjectileTargetComponent(entityId, 1, ProjectileType.enemy));

    const controlledShip = new ComputerControlledShipComponent(entityId, enemy.movementMode);
    controlledShip.vector = enemy.vector;

    if(enemy.movementMode == MovementMode.path) {
        controlledShip.path = enemy.path.map(p => new Point(p.x, p.y));
    }

    game.state.ecs.components.computerControlledShipComponents.add(controlledShip);

    return entityId;
}

export function createAsteroid(game: Game, location: Point) {
    const image = game.images.get("asteroid");
    const entityId = game.state.ecs.allocateEntityId();

    const dimensions = new DimensionsComponent(entityId, new Rectangle(location.x, location.y, image.width, image.height));
    dimensions.center = new Point(image.width / 2, image.height / 2);
    dimensions.rotationInDegrees = 0;
    
    game.state.ecs.components.dimensionsComponents.add(dimensions);
    game.state.ecs.components.velocityComponents.add(new VelocityComponent(entityId, Vector.fromDegreeAngle(180).multiplyScalar(20)));
    game.state.ecs.components.projectileTargetComponents.add(new ProjectileTargetComponent(entityId, 10, ProjectileType.enemy));
    game.state.ecs.components.renderComponents.add(new RenderComponent(entityId, new StaticImageProvider(image)));

    return entityId;
}