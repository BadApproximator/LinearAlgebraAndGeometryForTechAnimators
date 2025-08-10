import { CoodinateSystemRenderer } from "./drawing.js";
import { CoordinateSystem2D } from "./math2d.js";
import { ScreenToPointsConverter } from "./screenPoints.js";

// global objects/systems

export let screenToPointsConverter: ScreenToPointsConverter;
export let coordinateSystemRenderer: CoodinateSystemRenderer;

export function InitScreenToPointsConverter(canvas: HTMLCanvasElement) {
    screenToPointsConverter = new ScreenToPointsConverter(canvas);
}

// It is possible to have multiple coordinate systems, then we should have an Array<CoodinateSystemRenderer>
export function InitCoordinateSystemRenderer(canvas: HTMLCanvasElement, canvasCtx: CanvasRenderingContext2D, cs: CoordinateSystem2D) {
    coordinateSystemRenderer = new CoodinateSystemRenderer(canvas, canvasCtx, cs);

    canvas.addEventListener("mousemove", coordinateSystemRenderer.mouseMoveHandle);
    canvas.addEventListener("mousedown", coordinateSystemRenderer.mouseDownHandle);
    canvas.addEventListener("mouseup", coordinateSystemRenderer.mouseUpHandle);
}