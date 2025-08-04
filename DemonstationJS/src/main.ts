/**
 * Use 'npx tsc' for compilation
 * Use 'npx tsc --watch' for auto recompilation
 */

import { CoordinateSystem2D, Point2D, Basis, Vector2D, VectorSpace, AffineSpace } from "./math2d.js";
import { ScreenPoint, ScreenVector, ScreenToPointsConverter } from "./screenPoints.js"

const canvas = document.getElementById("coordSystem") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

// Canvas consists of pixels, so the default size is 300px x 150px.
// The HTML element <canvas> has another size defined by style attribute: clientWidth x clientHeight.
// Thus, we need to extend canvas up to full size of the HTML element to be able to draw everywhere inside of the element.
const displayWidth = canvas.clientWidth;
const displayHeight = canvas.clientHeight;

canvas.width = displayWidth;
canvas.height = displayHeight;

const backgroundColor = "PapayaWhip";

ctx.fillStyle = backgroundColor;
ctx.fillRect(0, 0, canvas.width, canvas.height);

// global objects
const screenToPointsConverter: ScreenToPointsConverter = new ScreenToPointsConverter(canvas);

const defaultCartesianCS: CoordinateSystem2D = new CoordinateSystem2D();

function DrawGrid(canvasCtx: CanvasRenderingContext2D, cs: CoordinateSystem2D) {
    const basis: Basis = cs.getBasis();
    const origin: Point2D = cs.getOrigin();
    const affineSpace: AffineSpace = cs.getAffineSpace();
    const vectorSpace: VectorSpace = affineSpace.getVectorSpace();

    const e1: Vector2D = basis.e1.copy();
    const e2: Vector2D = basis.e2.copy();
    const e1Negative: Vector2D = vectorSpace.scale(e1, -1);
    const e2Negative: Vector2D = vectorSpace.scale(e2, -1);

    canvasCtx.strokeStyle = "#ddd";
    canvasCtx.lineWidth = 1;
    canvasCtx.beginPath();

    let floatPoint: Point2D = origin.copy();

    // lines parallel e2
    const se1 = screenToPointsConverter.convertVector2dToScreenVector(e1);
    const se2 = screenToPointsConverter.convertVector2dToScreenVector(e2);

    DrawLine(canvas, canvasCtx, screenToPointsConverter.getScreenCoord(origin), se1);

    while (screenToPointsConverter.isPoint2DInCanvas(canvas, floatPoint)) {
        DrawLine(canvas, canvasCtx, screenToPointsConverter.getScreenCoord(floatPoint), se2);
        floatPoint = affineSpace.addVectorToPoint(floatPoint, e1);
    }

    cs.movePointAtOrigin(floatPoint);
    while (screenToPointsConverter.isPoint2DInCanvas(canvas, floatPoint)) {
        DrawLine(canvas, canvasCtx, screenToPointsConverter.getScreenCoord(floatPoint), se2);
        floatPoint = affineSpace.addVectorToPoint(floatPoint, e1Negative);
    }

    cs.movePointAtOrigin(floatPoint);
    while (screenToPointsConverter.isPoint2DInCanvas(canvas, floatPoint)) {
        DrawLine(canvas, canvasCtx, screenToPointsConverter.getScreenCoord(floatPoint), se1);
        floatPoint = affineSpace.addVectorToPoint(floatPoint, e2);
    }

    cs.movePointAtOrigin(floatPoint);
    while (screenToPointsConverter.isPoint2DInCanvas(canvas, floatPoint)) {
        DrawLine(canvas, canvasCtx, screenToPointsConverter.getScreenCoord(floatPoint), se1);
        floatPoint = affineSpace.addVectorToPoint(floatPoint, e2Negative);
    }

    canvasCtx.stroke();
}

/**
 * Draw line through the point with the direction
 */
function DrawLine(canvas: HTMLCanvasElement, canvasCtx: CanvasRenderingContext2D, p: ScreenPoint, v: ScreenVector) {
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

function DrawAxes(canvasCtx: CanvasRenderingContext2D, cs: CoordinateSystem2D) {

}


function DrawCoordinateSystemGrid2D(canvasCtx: CanvasRenderingContext2D, cs: CoordinateSystem2D) {
    DrawGrid(canvasCtx, cs);
    DrawAxes(canvasCtx, cs);
}

DrawCoordinateSystemGrid2D(ctx, defaultCartesianCS);