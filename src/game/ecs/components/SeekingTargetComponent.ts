import { Component, EntityId } from "../EntityComponentSystem";

export class SeekingTargetComponent extends Component {
    public targetId: EntityId;

    constructor(entityId: EntityId, targetId: EntityId) {
        super(entityId);
        this.targetId = targetId;
    }
}
