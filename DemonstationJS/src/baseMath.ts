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

export function RotateVector(v: Vector2DBase, angleRad: number) {
    return new Vector2DBase(
        v.x * Math.cos(angleRad) - v.y * Math.sin(angleRad),
        v.x * Math.sin(angleRad) + v.y * Math.cos(angleRad)
    );
}

export function IsVectorZero(v: Vector2DBase): boolean {
    return v.length() < 10e-5;
}