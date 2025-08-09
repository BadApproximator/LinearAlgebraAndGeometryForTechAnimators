import { assert } from "./messages.js";
import { CoordinateSystem2D, Point2D, Basis, Vector2D, VectorSpace, AffineSpace } from "./math2d.js";
import { ScreenPoint, ScreenVector, ScreenToPointsConverter } from "./screenPoints.js"
import { RotateVector, IsVectorZero } from "./baseMath.js";
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

const gridLineStyle: LineStyle = new LineStyle("#dddddd", 1);
const axisLineStyle: LineStyle = new LineStyle("#100057ff", 1);
const basisVectorStyle: VectorStyle = new VectorStyle("#573000ff", 3, Math.PI / 6, 10);

function DrawGrid(canvas: HTMLCanvasElement, canvasCtx: CanvasRenderingContext2D, cs: CoordinateSystem2D) {
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

    DrawLine(canvas, canvasCtx, screenToPointsConverter.getScreenCoord(origin), se1, gridLineStyle);

    while (screenToPointsConverter.isPoint2DInCanvas(canvas, floatPoint)) {
        DrawLine(canvas, canvasCtx, screenToPointsConverter.getScreenCoord(floatPoint), se2, gridLineStyle);
        floatPoint = affineSpace.addVectorToPoint(floatPoint, e1);
    }

    cs.movePointAtOrigin(floatPoint);
    while (screenToPointsConverter.isPoint2DInCanvas(canvas, floatPoint)) {
        DrawLine(canvas, canvasCtx, screenToPointsConverter.getScreenCoord(floatPoint), se2, gridLineStyle);
        floatPoint = affineSpace.addVectorToPoint(floatPoint, e1Negative);
    }

    cs.movePointAtOrigin(floatPoint);
    while (screenToPointsConverter.isPoint2DInCanvas(canvas, floatPoint)) {
        DrawLine(canvas, canvasCtx, screenToPointsConverter.getScreenCoord(floatPoint), se1, gridLineStyle);
        floatPoint = affineSpace.addVectorToPoint(floatPoint, e2);
    }

    cs.movePointAtOrigin(floatPoint);
    while (screenToPointsConverter.isPoint2DInCanvas(canvas, floatPoint)) {
        DrawLine(canvas, canvasCtx, screenToPointsConverter.getScreenCoord(floatPoint), se1, gridLineStyle);
        floatPoint = affineSpace.addVectorToPoint(floatPoint, e2Negative);
    }

    canvasCtx.stroke();
}

function DrawAxes(canvas: HTMLCanvasElement, canvasCtx: CanvasRenderingContext2D, cs: CoordinateSystem2D) {
    const basis: Basis = cs.getBasis();
    const origin: Point2D = cs.getOrigin();

    const e1: Vector2D = basis.e1.copy();
    const e2: Vector2D = basis.e2.copy();

    canvasCtx.beginPath();

    // lines parallel e2
    const se1 = screenToPointsConverter.convertVector2dToScreenVector(e1);
    const se2 = screenToPointsConverter.convertVector2dToScreenVector(e2);

    const screenOrigin: ScreenPoint = screenToPointsConverter.getScreenCoord(origin);

    DrawLine(canvas, canvasCtx, screenOrigin, se1, axisLineStyle);
    DrawLine(canvas, canvasCtx, screenOrigin, se2, axisLineStyle);
}

function DrawSegmentByTwoScreenPoints(
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

function DrawArrowHeadfunction(
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

function DrawVector(
    canvas: HTMLCanvasElement,
    canvasCtx: CanvasRenderingContext2D,
    origin: Point2D,
    vector: Vector2D,
    style: VectorStyle,
) {
    assert(!IsVectorZero(vector), "Direction has to be non zero vector!");

    const sOrigin = screenToPointsConverter.getScreenCoord(origin);
    const sVector = screenToPointsConverter.convertVector2dToScreenVector(vector);
    const vectorEnd = sOrigin.copy().addVector(sVector);

    DrawSegmentByTwoScreenPoints(canvas, canvasCtx, sOrigin, vectorEnd, style);
    DrawArrowHeadfunction(canvas, canvasCtx, vectorEnd, sVector, style);

}

function DrawBasis(canvas: HTMLCanvasElement, canvasCtx: CanvasRenderingContext2D, cs: CoordinateSystem2D) {
    const basis: Basis = cs.getBasis();
    const origin = cs.getOrigin();
    const e1 = basis.e1;
    const e2 = basis.e2;

    DrawVector(canvas, canvasCtx, origin, e1, basisVectorStyle);
    DrawVector(canvas, canvasCtx, origin, e2, basisVectorStyle);
}

/**
 * Draw line through the point with the direction
 */
function DrawLine(
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


export function DrawCoordinateSystemGrid2D(canvas: HTMLCanvasElement, canvasCtx: CanvasRenderingContext2D, cs: CoordinateSystem2D) {
    DrawGrid(canvas, canvasCtx, cs);
    DrawAxes(canvas, canvasCtx, cs);
    DrawBasis(canvas, canvasCtx, cs);
}