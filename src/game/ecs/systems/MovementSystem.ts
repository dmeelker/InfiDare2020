import { DimensionsComponent } from "../components/DimensionsComponent";
import { VelocityComponent } from "../components/VelocityComponent";
import { FrameTime } from "../../../utilities/FrameTime";
import { Game } from "../../..";

export function update(game: Game) {
    for(let velocityComponent of game.state.ecs.components.velocityComponents.all) {
        const dimensions = game.state.ecs.components.dimensionsComponents.get(velocityComponent.entityId);

        updateComponent(game.time, velocityComponent, dimensions);
    }
}

function updateComponent(time: FrameTime, velocityComponent: VelocityComponent, dimensionsComponent: DimensionsComponent) {
    dimensionsComponent.bounds.location.x += time.calculateMovement(velocityComponent.vector.x);
    dimensionsComponent.bounds.location.y += time.calculateMovement(velocityComponent.vector.y);
}