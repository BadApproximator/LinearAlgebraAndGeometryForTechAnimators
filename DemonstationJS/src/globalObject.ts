import { ScreenToPointsConverter } from "./screenPoints.js";

export let screenToPointsConverter: ScreenToPointsConverter;

export function InitScreenToPointsConverter(canvas: HTMLCanvasElement) {
    screenToPointsConverter = new ScreenToPointsConverter(canvas);
}