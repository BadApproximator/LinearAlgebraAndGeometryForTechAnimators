export class Vector2DBase {
    x: number;
    y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const length = this.length();
        this.x /= length;
        this.y /= length;
    }
    
    copy(): Vector2DBase {
        return new Vector2DBase(this.x, this.y);
    }
}

export class Point2DBase {
    x: number;
    y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }
}

export function RotateVector(v: Vector2DBase, angleRad: number) {
    return new Vector2DBase(
        v.x * Math.cos(angleRad) - v.y * Math.sin(angleRad),
        v.x * Math.sin(angleRad) + v.y * Math.cos(angleRad)
    );
}

export function IsVectorZero(v: Vector2DBase): boolean {
    return v.length() < 10e-5;
}

export function dist(p1: Point2DBase, p2: Point2DBase): number {
    return Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y));
}