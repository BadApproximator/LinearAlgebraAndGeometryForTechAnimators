/**
 * Use 'npx tsc' for compilation
 * Use 'npx tsc --watch' for auto recompilation
 */

import { CoordinateSystem2D, Point2D, Basis, Vector2D, VectorSpace, AffineSpace } from "./math2d.js";
import { ScreenPoint, ScreenToPointsConverter } from "./screenPoints.js"

const canvas = document.getElementById("coordSystem") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

// Canvas consists of pixels, so the default size is 300px x 150px.
// The HTML element <canvas> has another size defined by style attribute: clientWidth x clientHeight.
// Thus, we need to extend canvas up to full size of the HTML element to be able to draw everywhere inside of the element.
const displayWidth  = canvas.clientWidth;
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

    const n = 20;

    const e1: Vector2D = basis.e1.copy();
    const e2: Vector2D = basis.e2.copy();

    canvasCtx.strokeStyle = "#ddd";
    canvasCtx.lineWidth = 1;
    canvasCtx.beginPath();

    // lines parallel e2
    for (let i = -n; i <= n; i++) {
        const p: Point2D = affineSpace.addVectorToPoint(origin, vectorSpace.scale(e1, i));
        const p1: Point2D = affineSpace.addVectorToPoint(p, vectorSpace.scale(e2, -n));
        const p2: Point2D = affineSpace.addVectorToPoint(p, vectorSpace.scale(e2, n));

        const sp1: ScreenPoint = screenToPointsConverter.getScreenCoord(p1);
        const sp2: ScreenPoint = screenToPointsConverter.getScreenCoord(p2);

        canvasCtx.moveTo(sp1.x, sp1.y);
        canvasCtx.lineTo(sp2.x, sp2.y);
    }

    // lines parallel e1
    for (let i = -n; i <= n; i++) {
        let p: Point2D = affineSpace.addVectorToPoint(origin, vectorSpace.scale(e2, i));
        let p1: Point2D = affineSpace.addVectorToPoint(p, vectorSpace.scale(e1, -n));
        let p2: Point2D = affineSpace.addVectorToPoint(p, vectorSpace.scale(e1, n));

        const sp1: ScreenPoint = screenToPointsConverter.getScreenCoord(p1);
        const sp2: ScreenPoint = screenToPointsConverter.getScreenCoord(p2);

        canvasCtx.moveTo(sp1.x, sp1.y);
        canvasCtx.lineTo(sp2.x, sp2.y);
    }

    canvasCtx.stroke();
}

function DrawAxes(canvasCtx: CanvasRenderingContext2D, cs: CoordinateSystem2D) {
    
}


function DrawCoordinateSystemGrid2D(canvasCtx: CanvasRenderingContext2D, cs: CoordinateSystem2D) {
    DrawGrid(canvasCtx, cs);
    DrawAxes(canvasCtx, cs);
}

DrawCoordinateSystemGrid2D(ctx, defaultCartesianCS);