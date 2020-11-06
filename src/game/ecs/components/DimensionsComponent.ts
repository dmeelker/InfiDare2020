import { degreesToRadians, Point, Rectangle, Vector } from "../../../utilities/Trig";
import { Component, EntityId } from "../EntityComponentSystem";

export class DimensionsComponent extends Component {
    public bounds: Rectangle;
    public scale = new Point(1, 1);
    public center = new Point(0, 0);
    private _rotationInDegrees: number = 0;
    private _rotationInRadians: number = 0;
    public hasCollision: boolean;
    public spawnsZombies: boolean = false;

    constructor(entityId: EntityId, bounds: Rectangle, hasCollision: boolean = true) {
        super(entityId);
        this.bounds = bounds;
        this.center = new Point(bounds.width / 2, bounds.height / 2);
        this.hasCollision = hasCollision;
    }

    public get rotationInDegrees(): number {
        return this._rotationInDegrees;
    }

    public get rotationInRadians(): number {
        return this._rotationInRadians;
    }

    public set rotationInDegrees(degrees: number) {
        this._rotationInDegrees = degrees;
        this._rotationInRadians = degreesToRadians(degrees);
    }

    public get centerLocation(): Point {
        return this.bounds.location.add(this.center);
    }

    public move(translation: Vector) {
        this.bounds.location = this.bounds.location.add(translation);
    }
}
