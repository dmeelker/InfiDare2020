import { DimensionsComponent } from "../components/DimensionsComponent";
import { ProjectileComponent } from "../components/ProjectileComponent";
import { FrameTime } from "../../../utilities/FrameTime";
import { Game } from "../../..";

export function update(game: Game) {
    for(let projectileComponent of game.state.ecs.components.projectileComponents.all) {
        const dimensions = game.state.ecs.components.dimensionsComponents.get(projectileComponent.entityId);

        updateComponent(game.time, projectileComponent, dimensions);
    }
}

function updateComponent(time: FrameTime, projectileComponent: ProjectileComponent, dimensionsComponent: DimensionsComponent) {
    dimensionsComponent.bounds.location.x += time.calculateMovement(projectileComponent.vector.x);
    dimensionsComponent.bounds.location.y += time.calculateMovement(projectileComponent.vector.y);
    dimensionsComponent.rotationInDegrees = (time.currentTime - projectileComponent.creationTime); 
}