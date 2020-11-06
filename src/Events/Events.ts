import { EventArguments } from "./MessageBus";
import { randomInt } from "../utilities/Random";

export class EnemyKilledEventArgs extends EventArguments {    
    public constructor() {
        super(Events.EnemyKilled);
    }
}

export class DirkHitEventArgs extends EventArguments {  
    public readonly dirkHitType: number;  
    public constructor() {
        super(Events.DirkHit);
        this.dirkHitType = randomInt(1, 5);
    }
}

export class DirkDeathEventArgs extends EventArguments {  
    public readonly dirkHitType: number;  
    public constructor() {
        super(Events.DirkHit);
        this.dirkHitType = randomInt(0, 3);
    }
}


export enum Events {
    EnemyKilled,
    DirkHit,
    DirkDeath,
}