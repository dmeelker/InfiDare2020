export abstract class BaseScenario {
    public readonly Dialogs: Array<Dialog>

    private _state: number;

    public constructor() {
        this.Dialogs = new Array<Dialog>();
        this._state = 0;
    }

    protected add(dialog: Dialog) {
        this.Dialogs.push(dialog);
    }

    public current(): Dialog {
        return this.Dialogs[this._state];
    }

    public finished(): boolean {
        this._state += 1;
        return this.Dialogs.length <= this._state;
    }
}

export class Dialog {
    public static readonly You = "You";
    public readonly Speaker: string;
    public readonly Color: string;
    public readonly Sentences: Array<string>;

    public constructor(speaker: string, sentences: Array<string>, color?: string) {
        this.Speaker = speaker;
        if (sentences.length == 0 || sentences.length > 3) {
            throw new Error("Invalid number of sentences in dialog");
        }
        this.Sentences = sentences;
        this.Color = color;
    }
}

export class GameStart extends BaseScenario {
    public constructor() {
        super();
        this.add(new Dialog(Dialog.You, ["Another great day to work at MegaCorp", "... Oh no, a horde of corona zombies coming for", "all our TP. I have to stop them!"]));
        this.add(new Dialog("Zombies", ["Braaaaaai.... Toiletpaapeeeer!"]));
        this.add(new Dialog(Dialog.You, ["Mondays, am I right?"]));
    }
}

export class FirstEnemyKilled extends BaseScenario {
    public constructor() {
        super();
        this.add(new Dialog(Dialog.You, ["I got one!", "I don't get paid enough for this shit"]));
    }
}

export class GameOver extends BaseScenario {
    public constructor() {
        super();
        this.add(new Dialog("Game over!", ["You have lost!", "They've taken all of the TP!", "Now how will you survive the pandemic?!"]));
    }
}

export class DirkSpawned extends BaseScenario {
    public constructor() {
        super();
        this.add(new Dialog("Dirk", ["Hey, heb je even tijd om te bellen?"]));
        this.add(new Dialog("Dirk", ["Heb je je uren al geschreven?", "En ehm... is het al af?"]));
        this.add(new Dialog("Dirk", ["Enneh, even devils advocate he?", "Is er niet gewoon genoeg TP voor ons allemaal?"]));
        this.add(new Dialog(Dialog.You, ["Oh nee...", "Het is corona Dirk..."]));
    }
}



