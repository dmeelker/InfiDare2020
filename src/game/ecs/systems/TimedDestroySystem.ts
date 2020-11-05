import { Game } from "../../..";

export function update(game: Game) {
    for(let component of game.state.ecs.components.timedDestroyComponents.all) {
        if(component.destroyTime <= game.time.currentTime) {
            game.state.ecs.disposeEntity(component.entityId);
        }
    }
}