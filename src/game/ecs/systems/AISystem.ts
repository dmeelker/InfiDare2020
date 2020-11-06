import { Game } from "../../..";
import { Vector } from "../../../utilities/Trig";
import { GameState } from "../../GameState";
import { EntityId } from "../EntityComponentSystem";

const SPEED: number = 20;

export function update(game: Game) {
    game.state.enemies.forEach(enemyId => {
        const enemy = game.state.ecs.components.dimensionsComponents.get(enemyId);

        // TODO target toilet paper
        const player = game.state.ecs.components.dimensionsComponents.get(game.state.playerId);

        const velocity = player.centerLocation.subtract(enemy.centerLocation).toUnit()
            .multiplyScalar(game.time.calculateMovement(SPEED));

        if (canMove(game.state, enemyId, velocity)) {
            enemy.move(velocity);
        }
    });
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
