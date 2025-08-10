/**
 * Use 'npx tsc' for compilation
 * Use 'npx tsc --watch' for auto recompilation
 */

import { CoordinateSystem2D } from "./math2d.js";
import { coordinateSystemRenderer, InitCoordinateSystemRenderer, InitScreenToPointsConverter } from "./globalObject.js";

function init() {
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

    InitScreenToPointsConverter(canvas);

    const defaultCartesianCS: CoordinateSystem2D = new CoordinateSystem2D();
    InitCoordinateSystemRenderer(canvas, ctx, defaultCartesianCS);  

    coordinateSystemRenderer.draw();
}

init();