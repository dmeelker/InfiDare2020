import { Component, EntityId } from "../EntityComponentSystem";

export class BarrierComponent extends Component {
    public hitpoints: number;

    constructor(entityId: EntityId, hitpoints: number) {
        super(entityId);
        this.hitpoints = hitpoints;
    }
}
