import { Point } from "../../../utilities/Trig";
import { Component, EntityId } from "../EntityComponentSystem";

export class EnemyComponent extends Component {
    public target: Point;
    
    constructor(entityId: EntityId) {
        super(entityId);
    }
}