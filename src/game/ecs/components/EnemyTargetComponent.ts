import { Component, EntityId } from "../EntityComponentSystem";

export class EnemyTargetComponent extends Component {
     constructor(entityId: EntityId) {
        super(entityId);
    }
}
