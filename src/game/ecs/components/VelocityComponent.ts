import { Vector } from "../../../utilities/Trig";
import { Component, EntityId } from "../EntityComponentSystem";

export class VelocityComponent extends Component {
    public vector: Vector;

    constructor(entityId: EntityId, vector: Vector) {
        super(entityId);
        this.vector = vector;
    }
}
