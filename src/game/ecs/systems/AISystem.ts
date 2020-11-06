import { Game } from "../../..";

const SPEED: number = 20;

export function update(game: Game) {
    game.state.enemies.forEach(enemyId => {
        const enemy = game.state.ecs.components.dimensionsComponents.get(enemyId);

        // TODO target toilet paper
        const player = game.state.ecs.components.dimensionsComponents.get(game.state.playerId);

        const velocity = player.centerLocation.subtract(enemy.centerLocation).toUnit()
            .multiplyScalar(game.time.calculateMovement(SPEED));
        enemy.move(velocity);
    });
}
