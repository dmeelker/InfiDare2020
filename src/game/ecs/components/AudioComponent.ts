import { Component, EntityId } from "../EntityComponentSystem";

export class AudioComponent extends Component {
    public readonly audio: HTMLAudioElement;
    public readonly loop:boolean;

    public constructor(entityId: EntityId, pathToAudioFile: string, loop?:boolean) {
        super(entityId);
        this.audio = new Audio("../../../../gfx/" + pathToAudioFile);
        this.loop = loop ?? false;
    }
}