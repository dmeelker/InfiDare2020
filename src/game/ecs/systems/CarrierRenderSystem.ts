import { EntityComponentSystem } from "../EntityComponentSystem";
import { DimensionsComponent } from "../components/DimensionsComponent";
import { CarrierComponent } from "../components/CarrierComponent";
import { Point } from "../../../utilities/Trig";
import { Game } from "../../..";

export function render(game: Game, context: CanvasRenderingContext2D) {
    for(let carrierComponent of game.state.ecs.components.carrierComponents.all) {
        const dimensions = game.state.ecs.components.dimensionsComponents.get(carrierComponent.entityId);
        renderCarriedObject(game, carrierComponent, dimensions, context);
    }
}

function renderCarriedObject(game: Game, carrierComponent: CarrierComponent, dimensionsComponent: DimensionsComponent, context: CanvasRenderingContext2D) {
    const halfSize = dimensionsComponent.bounds.halfSize();
    const carrierLocation = dimensionsComponent.centerLocation;
    const carryableSize = new Point(carrierComponent.image.width as number, carrierComponent.image.height as number);

    const centerLocation = new Point(
        carrierLocation.x, 
        carrierLocation.y - halfSize.height - (carryableSize.x / 2));

    const drawSize = new Point(carryableSize.x / 1.5, carryableSize.y / 1.5);

    context.drawImage(
        carrierComponent.image, 
        centerLocation.x - (drawSize.x / 2),
        centerLocation.y - (drawSize.y / 2) + (Math.sin(game.time.currentTime / 100) ),
        drawSize.x,
        drawSize.y
    );
}