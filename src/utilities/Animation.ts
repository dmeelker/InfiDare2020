import { IImageProvider } from "../game/ecs/components/RenderComponent";

export class AnimationDefinition {
    public readonly frames: Array<ImageBitmap>;
    public readonly speed: number;
    public readonly duration: number;

    public constructor(frames: Array<ImageBitmap>, speed: number) {
        this.frames = frames;
        this.speed = speed;
        this.duration = frames.length * speed;
    }
}

export class AnimationInstance implements IImageProvider {
    private readonly _definition: AnimationDefinition;
    private readonly _creationTime: number;
    private _frameIndex = 0;

    public constructor(definition: AnimationDefinition) {
        this._definition = definition;
        this._creationTime = Date.now();
    }

    public getImage(): CanvasImageSource {
        const age = Date.now() - this._creationTime;
        const frame = Math.floor(age / this._definition.speed) % this._definition.frames.length;
        return this._definition.frames[frame];
    }
}

export class AnimationRepository {
    private readonly _animations = new Map<string, AnimationDefinition>();

    public add(code: string, definition: AnimationDefinition) {
        this._animations.set(code, definition);
    }

    public get(code: string) : AnimationDefinition | undefined {
        return this._animations.get(code);
    }
}