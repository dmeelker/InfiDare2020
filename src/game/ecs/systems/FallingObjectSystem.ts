import { Game } from "../../..";

export function update(game: Game) {
    for(let component of game.state.ecs.components.fallingObjectComponents.all) {
        let dimensions = game.state.ecs.components.dimensionsComponents.get(component.entityId);
        dimensions.bounds.location.y += game.time.calculateMovement(component.speed);
        component.speed += game.time.calculateMovement(200);

        let distanceTravelled = (1 - dimensions.bounds.location.y / component.targetLocation.y) * 0.5;
        dimensions.scale.x = 1 + distanceTravelled;
        dimensions.scale.y = 1 + distanceTravelled;

        if(dimensions.bounds.location.y > component.targetLocation.y) {
            dimensions.bounds.location.y = component.targetLocation.y;
            game.state.ecs.components.fallingObjectComponents.remove(component.entityId);
            dimensions.hasCollision = true;
        }
    }
}