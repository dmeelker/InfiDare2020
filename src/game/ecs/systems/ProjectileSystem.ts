import { Game } from "../../..";
import { Rectangle } from "../../../utilities/Trig";
import { ProjectileComponent, ProjectileType } from "../components/ProjectileComponent";
import { ProjectileTargetComponent } from "../components/ProjectileTargetComponent";
import { createExplosion } from "../EntityFactory";

export function update(game: Game) {
    const projectiles = game.state.ecs.components.projectileComponents.all;

    for (let projectile of projectiles) {
        const projectileDimensions = game.state.ecs.components.dimensionsComponents.get(projectile.entityId).bounds;
        handleTargetCollisions(game, projectileDimensions, projectile);
    }
}

function handleTargetCollisions(game: Game, projectileDimensions: Rectangle, projectile: ProjectileComponent) {
    for (let target of game.state.ecs.components.projectileTargetComponents.all) {
        const targetDimensions = game.state.ecs.components.dimensionsComponents.get(target.entityId).bounds;

        if (projectile.source != target.type && projectileDimensions.overlaps(targetDimensions)) {
            target.hitpoints -= projectile.power;
            target.lastHitTime = game.time.currentTime;

            if (target.hitpoints <= 0) {
                destroyShip(game, targetDimensions, target);
            }

            game.state.ecs.disposeEntity(projectile.entityId);
        }
    }
}
function destroyShip(game: Game, targetDimensions: Rectangle, target: ProjectileTargetComponent) {
    createExplosion(game, targetDimensions.location);
    game.state.ecs.disposeEntity(target.entityId);

    if (target.type == ProjectileType.enemy) {
        game.state.score.add(10);
    }
}

