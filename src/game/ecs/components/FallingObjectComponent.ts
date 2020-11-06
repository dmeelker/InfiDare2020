import { Point } from "../../../utilities/Trig";
import { Component, EntityId } from "../EntityComponentSystem";

export class FallingObjectComponent extends Component {
    public targetLocation: Point;
    public speed: number;

    constructor(entityId: EntityId, targetLocation: Point, speed: number) {
        super(entityId);
        this.targetLocation = targetLocation;
        this.speed = speed;
    }
}
