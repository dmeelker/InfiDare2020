import { Rectangle } from "../../../utilities/Trig";
import { EntityId } from "../EntityComponentSystem";
import { DimensionsComponent } from "./DimensionsComponent";

export class LivingComponent extends DimensionsComponent {
    public hp: number;

    constructor(entityId: EntityId, bounds: Rectangle, hp: number, hasCollision: boolean = false) {
        super(entityId, bounds, hasCollision);
        this.hp = hp;
    }
}
