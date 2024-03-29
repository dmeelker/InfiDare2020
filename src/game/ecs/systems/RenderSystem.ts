import { EntityComponentSystem } from "../EntityComponentSystem";
import { RenderComponent } from "../components/RenderComponent";
import { DimensionsComponent } from "../components/DimensionsComponent";

export function render(ecs: EntityComponentSystem, context: CanvasRenderingContext2D) {
    for(let renderComponent of ecs.components.renderComponents.all) {
        const dimensions = ecs.components.dimensionsComponents.get(renderComponent.entityId);
        updateComponent(renderComponent, dimensions, context);
    }
    for(let renderComponent of ecs.components.movingRenderComponents.all) {
        const dimensions = ecs.components.dimensionsComponents.get(renderComponent.entityId);
        updateComponent(renderComponent, dimensions, context);
    }
}

function updateComponent(renderComponent: RenderComponent, dimensionsComponent: DimensionsComponent, context: CanvasRenderingContext2D) {
    const location = dimensionsComponent.bounds.location.round();
    const center = dimensionsComponent.center.round();
    const scale = dimensionsComponent.scale;

    if (dimensionsComponent.rotationInRadians == 0 && scale.x == 1 && scale.y == 1) {
         context.drawImage(renderComponent.image.getImage(), location.x, location.y);
    } else {
        context.save();
        context.translate(location.x + center.x, location.y + center.y);
        context.scale(scale.x, scale.y);
        context.rotate(dimensionsComponent.rotationInRadians);
        context.drawImage(renderComponent.image.getImage(), -center.x, -center.y);
        context.restore();
    }
}