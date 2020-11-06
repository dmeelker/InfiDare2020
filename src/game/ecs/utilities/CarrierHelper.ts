import { Game } from "../../..";
import { Point } from "../../../utilities/Trig";
import { CarrierComponent } from "../components/CarrierComponent";
import { CarryableComponent } from "../components/CarryableComponent";
import { EntityId } from "../EntityComponentSystem";

export function findNearestCarryable(game: Game, carrierEntityId: EntityId): CarryableComponent {
    const dimensions = game.state.ecs.components.dimensionsComponents.get(carrierEntityId);
    var characterBounds = dimensions.bounds.addBorder(10);

    const carryableComponents = game.state.ecs.components.carryableComponents.all;

    for(let carryable of carryableComponents) {
        var carryableDimensions = game.state.ecs.components.dimensionsComponents.get(carryable.entityId);

        if(characterBounds.overlaps(carryableDimensions.bounds)) {
            return carryable;
        }
    }

    return null;
}

export function carryObject(game: Game, carrierEntityId: EntityId, carryableEntityId: EntityId) {
    const ecs = game.state.ecs;
    const carryable = ecs.components.carryableComponents.get(carryableEntityId);

    const carryableImage = ecs.components.renderComponents.get(carryable.entityId);

    const carryableComponents = ecs.components.exportSingleEntity(carryable.entityId);
    ecs.components.removeComponentsForEntity(carryable.entityId);

    let carrier = new CarrierComponent(carrierEntityId);
    carrier.carriedEntityId = carryable.entityId;
    carrier.carriedEntityComponents = carryableComponents;
    carrier.image = carryableImage.image.getImage();

    ecs.components.carrierComponents.add(carrier);
}

export function dropCarriedObject(game: Game, carrierEntityId: EntityId) {
    const ecs = game.state.ecs;
    const carrier = ecs.components.carrierComponents.get(carrierEntityId);
    const carrierDimensions = ecs.components.dimensionsComponents.get(carrierEntityId);

    ecs.components.import(carrier.carriedEntityComponents);
    const carryableDimensions = ecs.components.dimensionsComponents.get(carrier.carriedEntityId);
    const carryableHalfSize = carryableDimensions.bounds.halfSize();

    carryableDimensions.bounds.location = new Point(carrierDimensions.centerLocation.x - carryableHalfSize.width, carrierDimensions.bounds.y + carrierDimensions.bounds.height); 

    ecs.components.carrierComponents.remove(game.state.playerId);
}

export function isCarryingObject(game: Game, carrierEntityId: EntityId): boolean {
    const carrier = game.state.ecs.components.carrierComponents.get(carrierEntityId);
    return carrier != null;
}