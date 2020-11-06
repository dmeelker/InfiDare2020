import { Point } from "../../../utilities/Trig";
import { Component, EntityId } from "../EntityComponentSystem";
import { randomInt } from "../../../utilities/Random";

export enum EnemyState {
    FindingTarget,
    MovingToPos,
}

export class EnemyComponent extends Component {
    public state = EnemyState.FindingTarget;
    public hasTP = false;
    public targetId: EntityId;
    public targetPos: Point;
    private readonly baseSpeed: number;

    constructor(entityId: EntityId) {
        super(entityId);

        this.baseSpeed = randomInt(25, 75);
    }
    
    public getSpeed() {
        return this.baseSpeed + (this.state == EnemyState.MovingToPos ? 15 : 0);
    }
}
