import { Component, EntityId } from "../EntityComponentSystem";

export class BarrierComponent extends Component {
    public hitpoints: number;

    public get isDestroyable(): boolean {
        return this.hitpoints > -1;
    }

    constructor(entityId: EntityId, hitpoints: number) {
        super(entityId);
        this.hitpoints = hitpoints;
    }
}
