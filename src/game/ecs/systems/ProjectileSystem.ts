import { DimensionsComponent } from "../components/DimensionsComponent";
import { ProjectileComponent } from "../components/ProjectileComponent";
import { FrameTime } from "../../../utilities/FrameTime";
import { Game } from "../../..";
import { LivingComponent } from "../components/LivingComponent";

export function update(game: Game) {
    for (let projectileComponent of game.state.ecs.components.projectileComponents.all) {
        const projectile = game.state.ecs.components.dimensionsComponents.get(projectileComponent.entityId);

        updateComponent(game.time, projectileComponent, projectile);
        for (let enemyId of game.state.enemies) {
            const enemy = game.state.ecs.components.dimensionsComponents.get(enemyId) as LivingComponent;
            if (enemy.bounds.overlaps(projectile.bounds)) {
                game.state.ecs.components.removeComponentsForEntity(projectileComponent.entityId);
                enemy.hp -= 1;
                if (enemy.hp <= 0) {
                    game.state.ecs.components.removeComponentsForEntity(enemy.entityId);
                    game.state.enemies = game.state.enemies.filter(id => id != enemy.entityId);
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
