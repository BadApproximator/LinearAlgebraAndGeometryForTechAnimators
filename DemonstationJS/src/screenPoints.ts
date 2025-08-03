import { Point2D } from "./math2d.js";

// ----- Screen points and geom points ----- // 

const PIXELS_PER_UNIT = 50

// ScreenPoint is not the same as Point2D due to natural reasons, the difference is in the interface (may be appear later)
export class ScreenPoint {
    x: number = 0;
    y: number = 0;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }
}

export class ScreenToPointsConverter {
    constructor(canvas : HTMLCanvasElement, pixelsPerUnit: number = PIXELS_PER_UNIT) {
        this.screenCenter = new ScreenPoint(canvas.width / 2, canvas.height / 2);
        this.pixelsPerUnit = pixelsPerUnit;
    }

    /**
     * Let (x,y) - point in Geom Space, (x',y') - point in Screen Space, (x0,y0) - screen center in Screen Space, l - pixels per unit. 
     * Then
     *  x' = x0 + lx,
     *  y' = y0 - ly.
     * And controversly,
     *  x = (x' - x0) / l,
     *  y = (-y' + y0) / l.
     */
    public getScreenCoord(p: Point2D): ScreenPoint {
        return new ScreenPoint(
            this.screenCenter.x + p.x * this.pixelsPerUnit, 
            this.screenCenter.y - p.y * this.pixelsPerUnit
        );
    }
    public getPointByScreenCoord(p: ScreenPoint): Point2D {
        return new Point2D(
            (p.x - this.screenCenter.x) / this.pixelsPerUnit, 
            (-p.y + this.screenCenter.y) / this.pixelsPerUnit
        );
    }

// private
    private pixelsPerUnit: number;
    private screenCenter : ScreenPoint;
}