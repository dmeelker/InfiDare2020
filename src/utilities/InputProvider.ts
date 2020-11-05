import { GamepadPoller } from "./GamepadPoller";
import { Keyboard } from "./Keyboard";

export enum Keys {
    MoveLeft,
    MoveRight,
    MoveUp,
    MoveDown,
    Fire
}

class GamepadBinding {
    constructor(public gamepad: number, public button: number)
    {}
}

export class InputProvider {
    private readonly _keyboard: Keyboard;
    private readonly _gamepadPoller: GamepadPoller;
    private readonly _keyboardBindings = new Map<Keys, string>();
    private readonly _gamepadBindings = new Map<Keys, GamepadBinding>();

    public constructor(keyboard: Keyboard, gamepadPoller: GamepadPoller){
        this._keyboard = keyboard;
        this._gamepadPoller = gamepadPoller;
    }

    public addKeyboardBinding(key: Keys, keyCode: string) {
        this._keyboardBindings.set(key, keyCode);
    }

    public clearGamepadBindings() {
        this._gamepadBindings.clear();
    }

    public addGamepadBinding(key: Keys, gamepad: number, buttonIndex: number) {
        this._gamepadBindings.set(key, new GamepadBinding(gamepad, buttonIndex));
    }

    public isButtonDown(key: Keys): boolean {
        if(this._keyboardBindings.has(key)) {
            const keyCode = this._keyboardBindings.get(key);

            if(this._keyboard.isButtonDown(keyCode)) {
                return true;
            }
        }

        if(this._gamepadBindings.has(key)) {
            const binding = this._gamepadBindings.get(key);

            if (this._gamepadPoller.isButtonDown(binding.gamepad, binding.button)) {
                return true;
            }
        }

        return false;
    }

    public wasButtonPressedInFrame(key: Keys): boolean {
        if(this._keyboardBindings.has(key)) {
            const keyCode = this._keyboardBindings.get(key);

            if(this._keyboard.wasButtonPressedInFrame(keyCode)) {
                return true;
            }
        } 

        if(this._gamepadBindings.has(key)) {
            const binding = this._gamepadBindings.get(key);

            if (this._gamepadPoller.wasButtonPressedInFrame(binding.gamepad, binding.button)) {
                return true;
            }
        }

        return false;
    }
}