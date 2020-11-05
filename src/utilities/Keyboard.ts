export class Keyboard {
    private readonly _keyStates = new Map<string, boolean>();
    private readonly _frameButtonPresses = new Map<string, boolean>();

    constructor() {
        this.hook();
    }

    private hook() {
        document.addEventListener('keydown', event => this.onKeyDown(event));
        document.addEventListener('keyup', event => this.onKeyUp(event));
    }

    private onKeyDown(keyEvent: KeyboardEvent) {
        if(keyEvent.repeat) {
            return;
        }
        
        this._keyStates.set(keyEvent.code, true);
        this._frameButtonPresses.set(keyEvent.code, true);
    }

    private onKeyUp(keyEvent: KeyboardEvent) {
        this._keyStates.set(keyEvent.code, false);
    }

    public isButtonDown(code: string): boolean {
        if(this._keyStates.has(code)) {
            return this._keyStates.get(code);
        }

        return false;
    }

    public wasButtonPressedInFrame(code: string): boolean {
        if(this._frameButtonPresses.has(code)) {
            return this._frameButtonPresses.get(code);
        }

        return false;
    }

    public nextFrame() {
        this._frameButtonPresses.clear();
    }
}