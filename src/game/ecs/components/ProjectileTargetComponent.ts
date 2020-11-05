import { Component, EntityId } from "../EntityComponentSystem";
import { ProjectileType } from "./ProjectileComponent";

export class ProjectileTargetComponent extends Component {
    public hitpoints = 1;
    public type: ProjectileType;
    public lastHitTime = 0;

    constructor(entityId: EntityId, hitpoints: number, type: ProjectileType) {
        super(entityId);
        this.hitpoints = hitpoints
        this.type = type;
    }
}