import { Game } from "../../..";
import { Vector } from "../../../utilities/Trig";
import { GameState } from "../../GameState";
import { EntityId } from "../EntityComponentSystem";

const SPEED: number = 20;

export function update(game: Game) {
    const enemies = game.state.ecs.components.enemyComponents.all;

    for(let enemy of enemies) {
        const enemyDimensions = game.state.ecs.components.dimensionsComponents.get(enemy.entityId);
        const playerDimensions = game.state.ecs.components.dimensionsComponents.get(game.state.playerId);

        // TODO target toilet paper
        enemy.target = playerDimensions.centerLocation;

        const velocity = enemy.target.subtract(enemyDimensions.centerLocation).toUnit()
            .multiplyScalar(game.time.calculateMovement(SPEED));

        if (canMove(game.state, enemy.entityId, velocity)) {
            enemyDimensions.move(velocity);
        }
    }
}

export function canMove(state: GameState, id: EntityId, velocity: Vector): boolean {
    const mover = state.ecs.components.dimensionsComponents.get(id);
    const targetBounds = mover.bounds.translate(velocity);
    for (var component of state.ecs.components.dimensionsComponents.all) {
        if (component.bounds.overlaps(targetBounds) && component.entityId != mover.entityId) {
            return false;
        }
    }

    return true;
}
