import { Vector } from "../../../utilities/Trig";
import { Component, EntityId } from "../EntityComponentSystem";

export class ProjectileComponent extends Component {
    public creationTime: number;
    public vector: Vector;

    constructor(entityId: EntityId, vector: Vector, creationTime: number) {
        super(entityId);
        this.vector = vector;
        this.creationTime = creationTime;
    }
}
