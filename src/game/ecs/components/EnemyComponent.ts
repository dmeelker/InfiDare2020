import { Point } from "../../../utilities/Trig";
import { Component, EntityId } from "../EntityComponentSystem";

export enum EnemyState {
    FindingTarget,
    Leaving,
    Wander
}

export class EnemyComponent extends Component {
    public state = EnemyState.FindingTarget;
    public targetId: EntityId;

    constructor(entityId: EntityId) {
        super(entityId);
    }
}