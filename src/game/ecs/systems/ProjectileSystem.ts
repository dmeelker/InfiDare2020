import { DimensionsComponent } from "../components/DimensionsComponent";
import { ProjectileComponent } from "../components/ProjectileComponent";
import { FrameTime } from "../../../utilities/FrameTime";
import { Game } from "../../..";
import { LivingComponent } from "../components/LivingComponent";
import { EntityId } from "../EntityComponentSystem";
import * as CarrierHelper from "./../utilities/CarrierHelper"
import * as Events from "../../../Events/Events";

export function update(game: Game) {
    for (let projectileComponent of game.state.ecs.components.projectileComponents.all) {
        const projectile = game.state.ecs.components.dimensionsComponents.get(projectileComponent.entityId);
    }
}

function move(time: FrameTime, projectileComponent: ProjectileComponent, dimensionsComponent: DimensionsComponent) {
    dimensionsComponent.bounds.location.x += time.calculateMovement(projectileComponent.vector.x);
    dimensionsComponent.bounds.location.y += time.calculateMovement(projectileComponent.vector.y);
    dimensionsComponent.rotationInDegrees = (time.currentTime - projectileComponent.creationTime) * projectileComponent.rotationSpeed;
}

function checkForCollisions(game: Game, projectileComponent: ProjectileComponent, projectile: DimensionsComponent) {
    for (let enemy of game.state.ecs.components.enemyComponents.all) {
        const enemyDimensions = game.state.ecs.components.dimensionsComponents.get(enemy.entityId) as LivingComponent;
        if (enemyDimensions.bounds.overlaps(projectile.bounds)) {
            game.state.ecs.components.removeComponentsForEntity(projectileComponent.entityId);
            enemyDimensions.hp -= 1;
            if (enemyDimensions.hp <= 0) {
                game.messageBus.raise(Events.Events.EnemyKilled, new Events.EnemyKilledEventArgs());
                dropCarriedObject(game, enemy.entityId);
                game.state.ecs.disposeEntity(enemy.entityId);
            }
            break;
        }
    }
}

function dropCarriedObject(game: Game, entityId: EntityId) {
    if(CarrierHelper.isCarryingObject(game, entityId)) {
        CarrierHelper.dropCarriedObject(game, entityId);
    }
}