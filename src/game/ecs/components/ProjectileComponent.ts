import { Component, EntityId } from "../EntityComponentSystem";

export enum ProjectileType {
    player,
    enemy
}

export class ProjectileComponent extends Component {
    public power: number;
    public source: ProjectileType;

    constructor(entityId: EntityId, power: number, source: ProjectileType) {
        super(entityId);
        this.power = power;
        this.source = source;
    }
}