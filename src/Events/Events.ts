import { EventArguments } from "./MessageBus";

export class EnemyKilledEventArgs extends EventArguments {    
    public constructor() {
        super(Events.EnemyKilled);
    }
}




export enum Events {
    EnemyKilled,
}