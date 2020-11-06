import { Point } from "../../../utilities/Trig";
import { Component, EntityId } from "../EntityComponentSystem";
import { randomInt } from "../../../utilities/Random";

export enum EnemyState {
    FindingTarget,
    MovingToPos,
}

export enum EnemyBehaviour {
    Normal,
    Ram,
    Spawner
}

export class EnemyComponent extends Component {
    public state = EnemyState.FindingTarget;
    public hasTP = false;
    public targetId: EntityId;
    public targetPos: Point;
    private readonly baseSpeed: number;
    public behaviour = EnemyBehaviour.Normal;
    public ramForce = 1;

    constructor(entityId: EntityId, behaviour: EnemyBehaviour = EnemyBehaviour.Normal) {
        super(entityId);
        this.behaviour = behaviour;
        this.baseSpeed = randomInt(25, 75);
    }

    public getSpeed() {
        return this.baseSpeed + (this.state == EnemyState.MovingToPos ? 15 : 0);
    }
}
