import { DimensionsComponent } from "../components/DimensionsComponent";
import { ProjectileComponent } from "../components/ProjectileComponent";
import { FrameTime } from "../../../utilities/FrameTime";
import { Game } from "../../..";

export function update(game: Game) {
    for(let velocityComponent of game.state.ecs.components.projectileComponents.all) {
        const dimensions = game.state.ecs.components.dimensionsComponents.get(velocityComponent.entityId);

        updateComponent(game.time, velocityComponent, dimensions);
    }
}

function updateComponent(time: FrameTime, velocityComponent: ProjectileComponent, dimensionsComponent: DimensionsComponent) {
    dimensionsComponent.bounds.location.x += time.calculateMovement(velocityComponent.vector.x);
    dimensionsComponent.bounds.location.y += time.calculateMovement(velocityComponent.vector.y);
}