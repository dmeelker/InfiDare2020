export class FrameCounter {
    private _counter = 0;
    private _fps = 0;
    private _lastFrameTime = Date.now();

    public frame() {
        const now = Date.now();
        this._counter++;

        if (now - this._lastFrameTime >= 1000) {
            this._lastFrameTime = now;
            this._fps = this._counter;
            this._counter = 0;

            document.title = `FPS: ${this._fps}`;
        }
    }

    public get fps(): number {
        return this._fps;
    }
}
