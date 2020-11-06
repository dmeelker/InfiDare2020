import { Component, EntityId } from "../EntityComponentSystem";

export interface IImageProvider {
    getImage(): CanvasImageSource;
}

export class StaticImageProvider implements IImageProvider {
    private readonly _image: CanvasImageSource;

    public constructor(image: CanvasImageSource) {
        this._image = image;
    }

    public getImage(): CanvasImageSource {
        return this._image;
    }
}

export class RenderComponent extends Component {
    public image: IImageProvider;

    constructor(entityId: EntityId, image: IImageProvider) {
        super(entityId);
        this.image = image;
    }
}

export class MovingRenderComponent extends RenderComponent {
    private readonly _images: Map<Direction, ImageBitmap>;

    public constructor(entityId: EntityId, images: Map<Direction, ImageBitmap>) {
        super(entityId, new StaticImageProvider(images.get(Direction.Down)));
        this._images = images;
    }

    public setDirection(direction: Direction) {
        this.image = new StaticImageProvider(this._images.get(direction));
    }
}

export enum Direction {
    Up,
    Down,
    Left,
    Right
}
