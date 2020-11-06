import { Rectangle } from "../../../utilities/Trig";
import { EntityId } from "../EntityComponentSystem";
import { DimensionsComponent } from "./DimensionsComponent";

export class LivingComponent extends DimensionsComponent {
    public hp: number;

    constructor(entityId: EntityId, bounds: Rectangle, hp: number) {
        super(entityId, bounds, false);
        this.hp = hp;
    }
}
