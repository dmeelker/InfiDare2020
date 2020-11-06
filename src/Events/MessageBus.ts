import { Events } from "./Events";

export class MessageBus {
    private readonly _eventStore: Map<Events, Array<Function>>;

    public constructor() {
        this._eventStore = new Map<Events, Array<Function>>();
    }

    public subscribe(event: Events, action: Function) {
        var handlerList = this._eventStore.get(event);
        if (handlerList == undefined) {
            handlerList = new Array<Function>();
        }
        handlerList.push(action);
        this._eventStore.set(event, handlerList);
    }

    public raise(event: Events, eventArgs: EventArguments) {
        var handlerList = this._eventStore.get(event);
        handlerList.forEach(h => h(eventArgs));
    }
}

export abstract class EventArguments 
{
    public readonly EventName: Events;
    protected constructor(eventName: Events) {
        this.EventName = eventName;
    }
}