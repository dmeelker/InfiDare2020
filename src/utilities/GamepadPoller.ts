export class GamepadPoller {
    private _previousState = new Array<Gamepad>();
    private _currentState = new Array<Gamepad>();

    public poll() {
        this._previousState = this._currentState;
        this._currentState = navigator.getGamepads();
    }

    public isButtonDown(gamepadIndex: number, buttonIndex: number): boolean {
        return this.buttonDownInState(this._currentState, gamepadIndex, buttonIndex)
    }

    public wasButtonPressedInFrame(gamepadIndex: number, buttonIndex: number): boolean {
        return !this.buttonDownInState(this._previousState, gamepadIndex, buttonIndex) && this.isButtonDown(gamepadIndex, buttonIndex);
    }

    private buttonDownInState(state: Gamepad[], gamepadIndex: number, buttonIndex: number): boolean {
        if(state[gamepadIndex]) {
            return state[gamepadIndex].buttons[buttonIndex].pressed;
        } else {
            return false;
        }
    }
}