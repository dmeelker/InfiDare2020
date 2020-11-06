import { DimensionsComponent } from "../components/DimensionsComponent";
import { ProjectileComponent } from "../components/ProjectileComponent";
import { FrameTime } from "../../../utilities/FrameTime";
import { Game } from "../../..";
import { LivingComponent } from "../components/LivingComponent";

export function update(game: Game) {
    for (let projectileComponent of game.state.ecs.components.projectileComponents.all) {
        const projectile = game.state.ecs.components.dimensionsComponents.get(projectileComponent.entityId);

        updateComponent(game.time, projectileComponent, projectile);
        for (let enemy of game.state.ecs.components.enemyComponents.all) {
            const enemyDimensions = game.state.ecs.components.dimensionsComponents.get(enemy.entityId) as LivingComponent;
            if (enemyDimensions.bounds.overlaps(projectile.bounds)) {
                game.state.ecs.components.removeComponentsForEntity(projectileComponent.entityId);
                enemyDimensions.hp -= 1;
                if (enemyDimensions.hp <= 0) {
                    game.state.ecs.disposeEntity(enemy.entityId);
                }
                break;
            }
        }
    }
}

function updateComponent(time: FrameTime, projectileComponent: ProjectileComponent, dimensionsComponent: DimensionsComponent) {
    dimensionsComponent.bounds.location.x += time.calculateMovement(projectileComponent.vector.x);
    dimensionsComponent.bounds.location.y += time.calculateMovement(projectileComponent.vector.y);
    dimensionsComponent.rotationInDegrees = (time.currentTime - projectileComponent.creationTime) * projectileComponent.rotationSpeed;
}
