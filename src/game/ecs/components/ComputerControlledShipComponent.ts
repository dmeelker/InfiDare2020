import { Timer } from "../../../utilities/Timer";
import { Point, Vector } from "../../../utilities/Trig";
import { Component, EntityId } from "../EntityComponentSystem";

export enum MovementMode {
    straightLine,
    path
}

export class ComputerControlledShipComponent extends Component {
    public movementMode: MovementMode
    public vector: Vector = Vector.zero;
    public fireTimer = new Timer(2000);
    public path = new Array<Point>();
    public currentPathTarget = 0;

    constructor(entityId: EntityId, movementMode: MovementMode) {
        super(entityId);
        this.movementMode = movementMode;
    }
}