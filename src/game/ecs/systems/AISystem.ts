import { Game } from "../../..";

const SPEED: number = 0.6;

export function update(game: Game) {
    const enemy = game.state.ecs.components.dimensionsComponents.get(game.state.enemyId);

    // TODO target toilet paper
    const player = game.state.ecs.components.dimensionsComponents.get(game.state.playerId);

    const velocity = player.centerLocation.subtract(enemy.centerLocation).toUnit().multiplyScalar(SPEED);
    enemy.move(velocity);
}
