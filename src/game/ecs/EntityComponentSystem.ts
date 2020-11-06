import { DimensionsComponent } from "./components/DimensionsComponent";
import { RenderComponent, MovingRenderComponent } from "./components/RenderComponent";
import { TimedDestroyComponent } from "./components/TimedDestroyComponent";
import { ProjectileComponent } from "./components/ProjectileComponent";
import { CarryableComponent } from "./components/CarryableComponent";
import { CarrierComponent } from "./components/CarrierComponent";
import { EnemyComponent } from "./components/EnemyComponent";
import { EnemyTargetComponent } from "./components/EnemyTargetComponent";
import { textChangeRangeIsUnchanged } from "typescript";
import { AudioComponent } from "./components/AudioComponent";
import { FallingObjectComponent } from "./components/FallingObjectComponent";

export type EntityId = number;

export abstract class Component {
    public readonly entityId: EntityId;

    constructor(entityId: EntityId) {
        this.entityId = entityId;
    }
}

export class ComponentList<TComponent extends Component> {
    private readonly _components = new Map<EntityId, TComponent>();

    public get all(): Iterable<TComponent> {
        return this._components.values();
    }

    public get count(): number {
        return this._components.size;
    }

    public get(id: EntityId): TComponent | undefined {
        return this._components.get(id);
    }

    public add(component: TComponent) {
        return this._components.set(component.entityId, component);
    }

    public remove(id: EntityId) {
        return this._components.delete(id);
    }

    public clear() {
        this._components.clear();
    }
}

export class ComponentStore {
    public readonly renderComponents = new ComponentList<RenderComponent>();
    public readonly movingRenderComponents = new ComponentList<MovingRenderComponent>();
    public readonly dimensionsComponents = new ComponentList<DimensionsComponent>();
    public readonly projectileComponents = new ComponentList<ProjectileComponent>();
    public readonly timedDestroyComponents = new ComponentList<TimedDestroyComponent>();
    public readonly carrierComponents = new ComponentList<CarrierComponent>();
    public readonly carryableComponents = new ComponentList<CarryableComponent>();
    public readonly enemyComponents = new ComponentList<EnemyComponent>();
    public readonly enemyTargetComponents = new ComponentList<EnemyTargetComponent>();
    public readonly audioComponents = new ComponentList<AudioComponent>();
    public readonly fallingObjectComponents = new ComponentList<FallingObjectComponent>();

    private readonly _all = [
        this.renderComponents,
        this.movingRenderComponents,
        this.dimensionsComponents,
        this.projectileComponents,
        this.timedDestroyComponents,
        this.carrierComponents,
        this.carryableComponents,
        this.enemyComponents,
        this.enemyTargetComponents,
        this.audioComponents,
        this.fallingObjectComponents];

    public removeComponentsForEntity(entityId: EntityId) {
        this._all.forEach(store => store.remove(entityId));
    }

    public clear() {
        this._all.forEach(store => store.clear());
    }

    public exportSingleEntity(entityId: EntityId): ComponentStore {
        const result = new ComponentStore();

        for (let i = 0; i < this._all.length; i++) {
            const component = this._all[i].get(entityId);

            if (component) {
                result._all[i].add(component);
            }
        }

        return result;
    }

    public import(store: ComponentStore) {
        for (let i = 0; i < store._all.length; i++) {
            const components = store._all[i].all;

            for (let component of components) {
                this._all[i].add(component);
            }
        }
    }
}

export class EntityComponentSystem {
    public readonly components = new ComponentStore();
    public readonly entities = new Set<EntityId>();
    private _lastEntityId: EntityId = 0;
    private _availableEntityIds = new Array<EntityId>();
    private _disposableEntityIds = new Array<EntityId>();

    public constructor() {
        this.clear();
    }

    public allocateEntityId(): EntityId {
        if (this._availableEntityIds.length > 0) {
            return this._availableEntityIds.pop();
        } else {
            this._lastEntityId++;
            this.entities.add(this._lastEntityId);
            return this._lastEntityId;
        }
    }

    public freeEntityId(id: EntityId) {
        this.entities.delete(id);
        this._availableEntityIds.push(id);
    }

    public disposeEntity(id: EntityId) {
        this._disposableEntityIds.push(id);
    }

    public removeDisposedEntities() {
        while (this._disposableEntityIds.length > 0) {
            const id = this._disposableEntityIds.pop();
            this.freeEntityId(id);
            this.components.removeComponentsForEntity(id);
        }
    }

    public entityExists(id: EntityId): boolean {
        return this.entities.has(id);
    }

    public clear() {
        this.components.clear();
        this.entities.clear();
        this._availableEntityIds = [];
        this._disposableEntityIds = [];
        this._lastEntityId = 0;
    }
}
