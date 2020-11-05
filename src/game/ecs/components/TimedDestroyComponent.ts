import { Component, EntityId } from "../EntityComponentSystem";

export class TimedDestroyComponent extends Component {
    public destroyTime: number;

    constructor(entityId: EntityId, destroyTime: number) {
        super(entityId);
        this.destroyTime = destroyTime;
    }
}
