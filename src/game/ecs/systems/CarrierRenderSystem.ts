import { EntityComponentSystem } from "../EntityComponentSystem";
import { DimensionsComponent } from "../components/DimensionsComponent";
import { CarrierComponent } from "../components/CarrierComponent";

export function render(ecs: EntityComponentSystem, context: CanvasRenderingContext2D) {
    for(let carrierComponent of ecs.components.carrierComponents.all) {
        const dimensions = ecs.components.dimensionsComponents.get(carrierComponent.entityId);
        renderCarriedObject(carrierComponent, dimensions, context);
    }
}

function renderCarriedObject(carrierComponent: CarrierComponent, dimensionsComponent: DimensionsComponent, context: CanvasRenderingContext2D) {
    const halfSize = dimensionsComponent.bounds.halfSize();
    const carrierLocation = dimensionsComponent.centerLocation;

    context.drawImage(
        carrierComponent.image, carrierLocation.x - (carrierComponent.image.width as number / 2), 
        carrierLocation.y - halfSize.height - (carrierComponent.image.height as number) - 1);
}