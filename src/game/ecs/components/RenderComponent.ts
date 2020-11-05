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
