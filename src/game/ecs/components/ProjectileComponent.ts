import { Vector } from "../../../utilities/Trig";
import { Component, EntityId } from "../EntityComponentSystem";

export class ProjectileComponent extends Component {
    public creationTime: number;
    public vector: Vector;
    public rotationSpeed: number;

    constructor(entityId: EntityId, vector: Vector, creationTime: number, rotationSpeed: number) {
        super(entityId);
        this.vector = vector;
        this.creationTime = creationTime;
        this.rotationSpeed = rotationSpeed;
    }
}
