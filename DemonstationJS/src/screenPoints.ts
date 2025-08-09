import { Vector2DBase } from "./baseMath.js";
import { Point2D, Vector2D } from "./math2d.js";

// ----- Screen points and geom points ----- // 

const PIXELS_PER_UNIT = 50

// ScreenPoint is not the same as Point2D due to natural reasons, the difference is in the interface (may be appear later)
export class ScreenPoint {
    x: number;
    y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    addVector(v: ScreenVector) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    copy(): ScreenPoint {
        return new ScreenPoint(this.x, this.y);
    }

    setZero() {
        this.x = 0;
        this.y = 0;
    }

    set(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export class ScreenVector extends Vector2DBase {
    constructor(x: number = 0, y: number = 0) {
        super(x, y);
    }

    add(v: ScreenVector) {
        this.x += v.x;
        this.y += v.y;
    }

    scale(lambda: number) {
        this.x *= lambda;
        this.y *= lambda;
    }

    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const length = this.length();
        this.scale(1 / length);
    }
    
    copy(): ScreenVector {
        return new ScreenVector(this.x, this.y);
    }
}

export class ScreenToPointsConverter {
    constructor(canvas : HTMLCanvasElement, pixelsPerUnit: number = PIXELS_PER_UNIT) {
        this.screenOrigin = new ScreenPoint(canvas.width / 2, canvas.height / 2);
        this.pixelsPerUnit = pixelsPerUnit;
    }

    /**
     * Let (x,y) - point in Affine Space, (x',y') - point in Screen Space, (x0,y0) - screen center in Screen Space, l - pixels per unit. 
     * Then
     *  x' = x0 + lx,
     *  y' = y0 - ly.
     * And controversly,
     *  x = (x' - x0) / l,
     *  y = (-y' + y0) / l.
     */
    public getScreenCoord(p: Point2D): ScreenPoint {
        return new ScreenPoint(
            this.screenOrigin.x + p.x * this.pixelsPerUnit, 
            this.screenOrigin.y - p.y * this.pixelsPerUnit
        );
    }

    public getPointByScreenCoord(p: ScreenPoint): Point2D {
        return new Point2D(
            (p.x - this.screenOrigin.x) / this.pixelsPerUnit, 
            (-p.y + this.screenOrigin.y) / this.pixelsPerUnit
        );
    }

    public getScreenRadiusVector(p: ScreenPoint): ScreenVector {
        return new ScreenVector(p.x - this.screenOrigin.x, p.y - this.screenOrigin.y);
    }

    public isScreenPointInCanvas(canvas: HTMLCanvasElement, p: ScreenPoint): boolean {
        if (p.x > canvas.width || p.x < 0) return false;
        if (p.y > canvas.height || p.y < 0) return false;
        return true;
    }

    public isPoint2DInCanvas(canvas: HTMLCanvasElement, p: Point2D): boolean {
        const sp: ScreenPoint = this.getScreenCoord(p);
        return this.isScreenPointInCanvas(canvas, sp);
    }

    public convertVector2dToScreenVector(v: Vector2D): ScreenVector {
        const p: Point2D = new Point2D(v.x, v.y);
        const sp: ScreenPoint = this.getScreenCoord(p)
        return this.getScreenRadiusVector(sp);
    }

// private
    private pixelsPerUnit: number;
    private screenOrigin : ScreenPoint;
}