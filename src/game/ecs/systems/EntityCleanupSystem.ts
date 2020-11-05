import { Game } from "../../..";

export function update(game: Game) {
    const viewSizeWithMargin = game.view.size.addBorder(50);
    for (let dimensions of game.state.ecs.components.dimensionsComponents.all) {
        if (!dimensions.bounds.overlaps(viewSizeWithMargin)) {
            game.state.ecs.disposeEntity(dimensions.entityId);
        }
    }
}