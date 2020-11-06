import { Point } from "../../../utilities/Trig";
import { Component, EntityId } from "../EntityComponentSystem";

export enum EnemyState {
    FindingTarget,
    MovingToPos,
}

export class EnemyComponent extends Component {
    public state = EnemyState.FindingTarget;
    public hasTP = false;
    public targetId: EntityId;
    public targetPos: Point;

    constructor(entityId: EntityId) {
        super(entityId);
    }
}
