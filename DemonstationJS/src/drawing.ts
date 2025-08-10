import { assert } from "./messages.js";
import { CoordinateSystem2D, Point2D, Basis, Vector2D, VectorSpace, AffineSpace } from "./math2d.js";
import { ScreenPoint, ScreenVector, ScreenToPointsConverter } from "./screenPoints.js"
import { RotateVector, IsVectorZero, dist } from "./baseMath.js";
import { screenToPointsConverter } from "./globalObject.js";

// const canvas = document.getElementById("coordSystem") as HTMLCanvasElement;

class Style {
    color: string;
    constructor(color: string) {
        this.color = color;
    }
}

class LineStyle extends Style {
    width: number;

    constructor(color: string, width: number) {
        super(color);
        this.width = width;
    }
}

class VectorStyle extends LineStyle {
    arrowAngleRad: number;
    arrowSizePix: number;

    constructor(color: string, width: number, arrowAngleRad: number, arrowSizePix: number) {
        super(color, width);
        this.arrowAngleRad = arrowAngleRad;
        this.arrowSizePix = arrowSizePix;
    }
}

class HandlerStyle extends Style {
    hoveredColor: string;
    draggingColor: string;

    constructor(basicColor: string, hoveredColor: string, draggingColor: string) {
        super(basicColor);
        this.hoveredColor = hoveredColor;
        this.draggingColor = draggingColor;
    }
}

const gridLineStyle: LineStyle = new LineStyle("#dddddd", 1);
const axisLineStyle: LineStyle = new LineStyle("#100057ff", 1);
const basisVectorStyle: VectorStyle = new VectorStyle("#573000ff", 3, Math.PI / 6, 10);
const vectorHandlerStyle: HandlerStyle = new HandlerStyle("#dddddd", "#fa0202ff", "#11ff00ff");


export class CoodinateSystemRenderer {

    constructor(canvas: HTMLCanvasElement, canvasCtx: CanvasRenderingContext2D, cs: CoordinateSystem2D) {
        this.canvas = canvas;
        this.canvasCtx = canvasCtx;
        this.cs = cs;
    }

    draw() {
        this.drawCoordinateSystemGrid2D(this.canvas, this.canvasCtx, this.cs);
    }

    mouseMoveHandle(e: MouseEvent) {
        const pos: ScreenPoint = new ScreenPoint(e.offsetX, e.offsetY);

        if (this.draggingHandle) {
            this.draw();
            return;
        }

        this.hoveredHandle = this.getHandleAtPosition(pos);
        this.draw();
    }

    mouseDownHandle(e: MouseEvent) {
        const pos: ScreenPoint = new ScreenPoint(e.offsetX, e.offsetY);
        this.draggingHandle = this.getHandleAtPosition(pos);
        this.draw();
    }

    mouseUpHandle(e: MouseEvent) {
        this.draggingHandle = null;
        this.draw();
    }

    // private

    private HIT_RADIUS_PX = 10;
    private VECTOR_HANDLER_RADIUS_PX = 3;

    private canvas: HTMLCanvasElement;
    private canvasCtx: CanvasRenderingContext2D;
    private cs: CoordinateSystem2D;

    private hoveredHandle: HandleType = null;
    private draggingHandle: HandleType = null;

    private getHandleAtPosition(p: ScreenPoint): HandleType {
        const origin = screenToPointsConverter.getScreenCoord(this.cs.getOrigin());
        const e1end = origin.copy().addVector(screenToPointsConverter.convertVector2dToScreenVector(this.cs.getBasis().e1));
        const e2end = origin.copy().addVector(screenToPointsConverter.convertVector2dToScreenVector(this.cs.getBasis().e2));

        if (dist(p, e1end) < this.HIT_RADIUS_PX) return "e1";
        if (dist(p, e2end) < this.HIT_RADIUS_PX) return "e2";

        return null;
    }

    private drawGrid(canvas: HTMLCanvasElement, canvasCtx: CanvasRenderingContext2D, cs: CoordinateSystem2D) {
        const basis: Basis = cs.getBasis();
        const origin: Point2D = cs.getOrigin();
        const affineSpace: AffineSpace = cs.getAffineSpace();
        const vectorSpace: VectorSpace = affineSpace.getVectorSpace();

        const e1: Vector2D = basis.e1.copy();
        const e2: Vector2D = basis.e2.copy();
        const e1Negative: Vector2D = vectorSpace.scale(e1, -1);
        const e2Negative: Vector2D = vectorSpace.scale(e2, -1);

        canvasCtx.beginPath();

        let floatPoint: Point2D = origin.copy();

        // lines parallel e2
        const se1 = screenToPointsConverter.convertVector2dToScreenVector(e1);
        const se2 = screenToPointsConverter.convertVector2dToScreenVector(e2);

        this.drawLine(canvas, canvasCtx, screenToPointsConverter.getScreenCoord(origin), se1, gridLineStyle);

        while (screenToPointsConverter.isPoint2DInCanvas(canvas, floatPoint)) {
            this.drawLine(canvas, canvasCtx, screenToPointsConverter.getScreenCoord(floatPoint), se2, gridLineStyle);
            floatPoint = affineSpace.addVectorToPoint(floatPoint, e1);
        }

        cs.movePointAtOrigin(floatPoint);
        while (screenToPointsConverter.isPoint2DInCanvas(canvas, floatPoint)) {
            this.drawLine(canvas, canvasCtx, screenToPointsConverter.getScreenCoord(floatPoint), se2, gridLineStyle);
            floatPoint = affineSpace.addVectorToPoint(floatPoint, e1Negative);
        }

        cs.movePointAtOrigin(floatPoint);
        while (screenToPointsConverter.isPoint2DInCanvas(canvas, floatPoint)) {
            this.drawLine(canvas, canvasCtx, screenToPointsConverter.getScreenCoord(floatPoint), se1, gridLineStyle);
            floatPoint = affineSpace.addVectorToPoint(floatPoint, e2);
        }

        cs.movePointAtOrigin(floatPoint);
        while (screenToPointsConverter.isPoint2DInCanvas(canvas, floatPoint)) {
            this.drawLine(canvas, canvasCtx, screenToPointsConverter.getScreenCoord(floatPoint), se1, gridLineStyle);
            floatPoint = affineSpace.addVectorToPoint(floatPoint, e2Negative);
        }

        canvasCtx.stroke();
    }

    private drawAxes(canvas: HTMLCanvasElement, canvasCtx: CanvasRenderingContext2D, cs: CoordinateSystem2D) {
        const basis: Basis = cs.getBasis();
        const origin: Point2D = cs.getOrigin();

        const e1: Vector2D = basis.e1.copy();
        const e2: Vector2D = basis.e2.copy();

        canvasCtx.beginPath();

        // lines parallel e2
        const se1 = screenToPointsConverter.convertVector2dToScreenVector(e1);
        const se2 = screenToPointsConverter.convertVector2dToScreenVector(e2);

        const screenOrigin: ScreenPoint = screenToPointsConverter.getScreenCoord(origin);

        this.drawLine(canvas, canvasCtx, screenOrigin, se1, axisLineStyle);
        this.drawLine(canvas, canvasCtx, screenOrigin, se2, axisLineStyle);
    }

    private drawSegmentByTwoScreenPoints(
        canvas: HTMLCanvasElement,
        canvasCtx: CanvasRenderingContext2D,
        p1: ScreenPoint,
        p2: ScreenPoint,
        style: LineStyle,
    ) {
        canvasCtx.save();

        // apply style
        if (style?.color) canvasCtx.strokeStyle = style.color;
        if (style?.width) canvasCtx.lineWidth = style.width;

        canvasCtx.beginPath();

        canvasCtx.moveTo(p1.x, p1.y);
        canvasCtx.lineTo(p2.x, p2.y);

        canvasCtx.stroke();

        canvasCtx.restore();
    }

    private drawArrowHeadfunction(
        canvas: HTMLCanvasElement,
        canvasCtx: CanvasRenderingContext2D,
        p: ScreenPoint,
        dir: ScreenVector,
        style: VectorStyle,
    ) {
        assert(!IsVectorZero(dir), "Direction has to be non zero vector!");

        dir.normalize();
        dir.scale(-style.arrowSizePix);

        const v1 = RotateVector(dir, style.arrowAngleRad);
        const v2 = RotateVector(dir, -style.arrowAngleRad);

        const p1 = p.copy().addVector(v1 as ScreenVector);
        const p2 = p.copy().addVector(v2 as ScreenVector);

        canvasCtx.save();

        // apply style
        if (style?.color) canvasCtx.strokeStyle = style.color;
        if (style?.width) canvasCtx.lineWidth = style.width;

        canvasCtx.beginPath();

        canvasCtx.moveTo(p.x, p.y);
        canvasCtx.lineTo(p1.x, p1.y);

        canvasCtx.moveTo(p.x, p.y);
        canvasCtx.lineTo(p2.x, p2.y);

        canvasCtx.stroke();

        canvasCtx.restore();
    }

    private drawVector(
        canvas: HTMLCanvasElement,
        canvasCtx: CanvasRenderingContext2D,
        origin: Point2D,
        vector: Vector2D,
        style: VectorStyle,
        vectorType: VectorType,
        handlerType: HandleType,
    ) {
        assert(!IsVectorZero(vector), "Direction has to be non zero vector!");

        const sOrigin = screenToPointsConverter.getScreenCoord(origin);
        const sVector = screenToPointsConverter.convertVector2dToScreenVector(vector);
        const vectorEnd = sOrigin.copy().addVector(sVector);

        this.drawSegmentByTwoScreenPoints(canvas, canvasCtx, sOrigin, vectorEnd, style);
        this.drawArrowHeadfunction(canvas, canvasCtx, vectorEnd, sVector, style);

        // handlers
        if (vectorType === VectorType.Basis) {
            let state: HandleState;
            if (this.draggingHandle === handlerType) {
                state = HandleState.Dragging;
            } else if (this.hoveredHandle === handlerType) {
                state = HandleState.Hovered;
            } else {
                state = HandleState.None;
            }
            this.drawHandle(vectorEnd, state);
        }
    }

    drawHandle(pos: ScreenPoint, state: HandleState) {
        this.canvasCtx.save();
        this.canvasCtx.beginPath();
        this.canvasCtx.arc(pos.x, pos.y, this.VECTOR_HANDLER_RADIUS_PX, 0, Math.PI * 2);

        switch (state) {
            case HandleState.Dragging: {
                this.canvasCtx.fillStyle = vectorHandlerStyle.draggingColor;
                break;
            }
            case HandleState.Hovered: {
                this.canvasCtx.fillStyle = vectorHandlerStyle.hoveredColor;
                break;
            }
            default: {
                this.canvasCtx.fillStyle = vectorHandlerStyle.color;
            }
        }
        this.canvasCtx.fill();
        this.canvasCtx.restore();
    }

    drawBasis(canvas: HTMLCanvasElement, canvasCtx: CanvasRenderingContext2D, cs: CoordinateSystem2D) {
        const basis: Basis = cs.getBasis();
        const origin = cs.getOrigin();
        const e1 = basis.e1;
        const e2 = basis.e2;

        this.drawVector(canvas, canvasCtx, origin, e1, basisVectorStyle, VectorType.Basis, "e1");
        this.drawVector(canvas, canvasCtx, origin, e2, basisVectorStyle, VectorType.Basis, "e2");
    }

    /**
     * Draw line through the point with the direction
     */
    drawLine(
        canvas: HTMLCanvasElement,
        canvasCtx: CanvasRenderingContext2D,
        p: ScreenPoint,
        v: ScreenVector,
        style: LineStyle,
    ) {
        assert(!IsVectorZero(v), "Direction has to be non zero vector!");

        // apply style
        if (style?.color) canvasCtx.strokeStyle = style.color;
        if (style?.width) canvasCtx.lineWidth = style.width;
        
        
        let floatPoint: ScreenPoint = p.copy();
        let dir: ScreenVector = v.copy();
        dir.normalize();
        let p1, p2: ScreenPoint;
        while (screenToPointsConverter.isScreenPointInCanvas(canvas, floatPoint)) {
            floatPoint.addVector(dir);
        }
        p1 = floatPoint.copy();

        floatPoint.set(p.x, p.y);
        dir.scale(-1);
        while (screenToPointsConverter.isScreenPointInCanvas(canvas, floatPoint)) {
            floatPoint.addVector(dir);
        }
        p2 = floatPoint.copy();

        canvasCtx.beginPath();

        canvasCtx.moveTo(p1.x, p1.y);
        canvasCtx.lineTo(p2.x, p2.y);

        canvasCtx.stroke();
    }


    drawCoordinateSystemGrid2D(canvas: HTMLCanvasElement, canvasCtx: CanvasRenderingContext2D, cs: CoordinateSystem2D) {
        this.drawGrid(canvas, canvasCtx, cs);
        this.drawAxes(canvas, canvasCtx, cs);
        this.drawBasis(canvas, canvasCtx, cs);
    }
}

type HandleType = "e1" | "e2" | null;

enum VectorType {
    None = 1,
    Basis,
}

enum HandleState {
    None,
    Hovered,
    Dragging,
}