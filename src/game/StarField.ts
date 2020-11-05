import { FrameTime } from "../utilities/FrameTime";
import { randomArrayIndex, randomInt } from "../utilities/Random";
import { Point, Size } from "../utilities/Trig";

class Star {
    public location: Point;
    public brightness: number;
}

const columnWidth = 100;
const colors = ["#FFFFFF", "#AAAAAA", "#888888"];

export class StarField {
    private readonly _size: Size;
    private readonly _columnCount: number;

    private _columns = new Array<Array<Star>>();
    private readonly _movementSpeed: number;
    private readonly _density: number;
    private _xOffset = 0;

    constructor(size: Size, speed: number, density: number) {
        this._size = size;
        this._movementSpeed = speed;
        this._density = density;
        this._columnCount = (this._size.width / columnWidth) + 1;

        for(let i=0; i<this._columnCount; i++) {
            this._columns.push(this.generateStarColumn());
        }
    }

    public update(time: FrameTime) {
        this._xOffset -= time.calculateMovement(this._movementSpeed);

        while(this._xOffset < -columnWidth) {
            this._columns = this._columns.splice(1);
            this._columns.push(this.generateStarColumn());
            this._xOffset += columnWidth;
        }
    }

    private generateStarColumn(): Array<Star> {
        const stars = new Array<Star>();
        const starCount = (columnWidth * this._size.height) / this._density;

        for(let i=0; i<starCount; i++) {
            const x = randomInt(0, columnWidth);
            const y = randomInt(0, this._size.height);

            const star = new Star();
            star.location = new Point(x, y);
            star.brightness = randomArrayIndex(colors);
            stars.push(star);
        }

        return stars;
    }

    public render(context: CanvasRenderingContext2D) {
        let x = Math.floor(this._xOffset);

        for(let column of this._columns){

            for(let star of column) {
                context.fillStyle = colors[star.brightness];
                context.fillRect(x + star.location.x, star.location.y, 1, 1);
            }

            x += columnWidth;
        }
    }
}