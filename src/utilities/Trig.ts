// export interface Point {
//     x: number;
//     y: number;
// }

export class Point {
    constructor(public x: number, public y: number) {

    }

    public static fromVector(vector: Vector): Point {
        return new Point(vector.x, vector.y);
    }

    public toVector(): Vector {
        return new Vector(this.x, this.y);
    }

    public add(other: Point): Point {
        return new Point(this.x + other.x, this.y + other.y);
    }

    public distanceTo(other: Point): number {
        return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
    }
}

export interface Size {
    width: number;
    height: number;
}

export class Rectangle {
    public location: Point;
    public size: Size;

    public get x(): number {
        return this.location.x;
    }

    public get y(): number {
        return this.location.y;
    }

    public get width(): number {
        return this.size.width;
    }

    public get height(): number {
        return this.size.height;
    }

    public get center(): Point {
        return new Point(this.x + (this.width / 2), this.y + (this.height / 2));
    }

    constructor(x: number, y: number, width: number, height: number) {
        this.location = new Point(x, y);
        this.size = {width, height};
    }

    public overlaps(other: Rectangle): boolean {
        if (other.location.x + other.size.width <= this.location.x) return false;
        if (other.location.x >= this.location.x + this.size.width) return false;
        if (other.location.y + other.size.height <= this.location.y) return false;
        if (other.location.y >= this.location.y + this.size.height) return false;

        return true;
    }

    containsPoint(p: Point) {
        return p.x >= this.location.x && p.x < this.location.x + this.size.width &&
            p.y >= this.location.y && p.y < this.location.y + this.size.height;
    }

    public addBorder(size: number): Rectangle {
        return new Rectangle(this.location.x - size, this.location.y - size, this.size.width + (size * 2), this.size.height + (size * 2));
    }
}

export class Vector {
    private readonly _x: number;
    private readonly _y: number;

    constructor(x: number = 0, y: number = 0) {
        this._x = x;
        this._y = y;
    }

    public get x(): number {
        return this._x;
    }

    public get y(): number {
        return this._y;
    }

    public get length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    public add(vector: Vector) {
        return new Vector(this._x + vector.x, this._y + vector.y);
    }

    public subtract(vector: Vector) {
        return new Vector(this._x - vector.x, this._y - vector.y);
    }

    public multiplyScalar(scalar: number) {
        return new Vector(this._x * scalar, this._y * scalar);
    }

    public toUnit() {
        let length = this.length;

        return new Vector(this._x / length, this._y / length);
    }

    public get angleInRadians(): number {
        return Math.atan2(this._y, this._x);
    }

    public get angleInDegrees(): number {
        return radiansToDegrees(this.angleInRadians);
    }

    static interpolate(v1: Vector, v2: Vector, amount: number) {
        return new Vector(
            v1.x + ((v2.x - v1.x) * amount),
            v1.y + ((v2.y - v1.y) * amount));
    }

    static fromRadianAngle(radians: number) : Vector {
        return new Vector(
            Math.cos(radians),
            Math.sin(radians));
    }

    static fromDegreeAngle(degrees: number) : Vector {
        return this.fromRadianAngle(degreesToRadians(degrees));
    }

    public clone() {
        return new Vector(this.x, this.y);
    }

    static get zero() {
        return new Vector(0, 0);
    }
}

export function degreesToRadians(degrees: number) : number {
    return degrees * (Math.PI / 180);
}

export function radiansToDegrees(radians: number) : number {
    return radians * (180 / Math.PI);
}

export function normalizeDegrees(degrees: number) : number {
    degrees = degrees % 360;

    if(degrees < 0) {
        degrees += 360;
    }

    return degrees;
}