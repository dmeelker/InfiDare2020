import { DimensionsComponent } from "../components/DimensionsComponent";
import { Point } from "../../../utilities/Trig";
import { Game } from "../../..";
import { FallingObjectComponent } from "../components/FallingObjectComponent";

export function render(game: Game, context: CanvasRenderingContext2D) {
    for(let fallingObject of game.state.ecs.components.fallingObjectComponents.all) {
        const dimensions = game.state.ecs.components.dimensionsComponents.get(fallingObject.entityId);
        renderShadow(game, fallingObject, dimensions, context);
    }
}

function renderShadow(game: Game, carrierComponent: FallingObjectComponent, dimensionsComponent: DimensionsComponent, context: CanvasRenderingContext2D) {
    const image = game.images.get("shadow");
    const centerLocation = new Point(carrierComponent.targetLocation.x, carrierComponent.targetLocation.y + dimensionsComponent.bounds.height);
    let distanceTravelled = 1.5 - dimensionsComponent.bounds.location.y / carrierComponent.targetLocation.y;
    const drawSize = new Point(image.width * distanceTravelled, image.height * distanceTravelled);
    
    context.drawImage(
        image, 
        centerLocation.x - (drawSize.x / 2),
        centerLocation.y - (drawSize.y / 2),
        drawSize.x,
        drawSize.y
    );
}