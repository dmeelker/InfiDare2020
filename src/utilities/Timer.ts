export class Timer {
    private _lastTime = 0;
    public interval: number;
    
    public constructor(interval: number) {
        this.interval = interval;
    }

    public update(time: number): boolean {
        if(this._lastTime == 0) {
            this._lastTime = time;
            return;
        }

        const timeElapsed = time - this._lastTime;
        if(timeElapsed > this.interval) {
            this._lastTime = time;
            return true;
        } else {
            return false;
        }
    }

    public reset(time: number) {
        this._lastTime = time;
    }
}