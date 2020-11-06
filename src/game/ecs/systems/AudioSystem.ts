import { Game } from "../../..";

export function render(game: Game) {
    for(var component of game.state.ecs.components.audioComponents.all) {
        if(component.loop) {
            component.audio.loop = true;
        } 
        component.audio.play();

        game.state.ecs.components.audioComponents.remove(component.entityId);
    }
}