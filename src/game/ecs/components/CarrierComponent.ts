import { Component, ComponentStore, EntityId } from "../EntityComponentSystem";

export class CarrierComponent extends Component {
    public carriedEntityId: EntityId;
    public carriedEntityComponents: ComponentStore;
    public image: CanvasImageSource;

    constructor(entityId: EntityId) {
        super(entityId);
    }
}
