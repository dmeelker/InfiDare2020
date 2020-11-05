export class PlayerScore {
    private _points = 0;

    public reset() {
        this._points = 0;
    }

    public get points(): number {
        return this._points;
    }

    public add(points: number) {
        this._points += points;
    }
}