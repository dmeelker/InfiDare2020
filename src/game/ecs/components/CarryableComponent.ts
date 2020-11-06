import { Component, EntityId } from "../EntityComponentSystem";

export class CarryableComponent extends Component {
    constructor(entityId: EntityId) {
        super(entityId);
    }
}