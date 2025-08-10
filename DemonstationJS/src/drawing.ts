import { assert } from "./messages.js";
import { CoordinateSystem2D, Point2D, Basis, Vector2D, VectorSpace, AffineSpace } from "./math2d.js";
import { ScreenPoint, ScreenVector, ScreenToPointsConverter } from "./screenPoints.js"
import { rotateVector, isVectorZero, dist, dist2 } from "./baseMath.js";
import { screenToPointsConverter } from "./globalObject.js";

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

    init() {
        this.initGrid();
        this.initAxes();
        this.initBasis();
        this.draw();
    }

    draw() {
        this.drawCoordinateSystemGrid2D(this.canvas, this.canvasCtx, this.cs);
    }

    mouseMoveHandle(e: MouseEvent) {
        const pos: ScreenPoint = new ScreenPoint(e.offsetX, e.offsetY);

        for (const obj of this.screenObjects) {
            obj.mouseMoveHandle(pos);
        }

        this.draw();
    }

    mouseDownHandle(e: MouseEvent) {
        const pos: ScreenPoint = new ScreenPoint(e.offsetX, e.offsetY);
        
        for (const obj of this.screenObjects) {
            obj.mouseDownHandle(pos);
        }
        
        this.draw();
    }

    mouseUpHandle(e: MouseEvent) {
        const pos: ScreenPoint = new ScreenPoint(e.offsetX, e.offsetY);
        
        for (const obj of this.screenObjects) {
            obj.mouseUpHandle(pos);
        }

        this.draw();
    }

    // private

    private canvas: HTMLCanvasElement;
    private canvasCtx: CanvasRenderingContext2D;
    private cs: CoordinateSystem2D;

    private screenObjects: Array<ScreenObject> = new Array<ScreenObject>();

    private initGrid() {
        const origin = screenToPointsConverter.getScreenCoord(this.cs.getOrigin());
        const e1 = screenToPointsConverter.convertVector2dToScreenVector(this.cs.getBasis().e1);
        const e2 = screenToPointsConverter.convertVector2dToScreenVector(this.cs.getBasis().e2);
        const grid: GridObject = new GridObject(origin, e1, e2);
        this.screenObjects.push(grid);
    }

    private initAxes() {
        const origin = screenToPointsConverter.getScreenCoord(this.cs.getOrigin());
        const e1 = screenToPointsConverter.convertVector2dToScreenVector(this.cs.getBasis().e1);
        const e2 = screenToPointsConverter.convertVector2dToScreenVector(this.cs.getBasis().e2);
        
        const xAxis: AxisObject = new AxisObject(origin, e1);
        const yAxis: AxisObject = new AxisObject(origin, e2);

        this.screenObjects.push(xAxis, yAxis);
    }

    private initBasis() {
        const origin = screenToPointsConverter.getScreenCoord(this.cs.getOrigin());
        const e1 = screenToPointsConverter.convertVector2dToScreenVector(this.cs.getBasis().e1);
        const e2 = screenToPointsConverter.convertVector2dToScreenVector(this.cs.getBasis().e2);

        this.screenObjects.push(
            new BasisVectorObject(origin.copy(), origin.copy().addVector(e1)),
            new BasisVectorObject(origin.copy(), origin.copy().addVector(e2))
        );
    }

    drawCoordinateSystemGrid2D(canvas: HTMLCanvasElement, canvasCtx: CanvasRenderingContext2D, cs: CoordinateSystem2D) {
        for (const obj of this.screenObjects) {
            obj.draw(canvas, canvasCtx);
        }
    }
}


enum HandleState {
    None,
    Hovered,
    Dragging,
}

abstract class ScreenObjectHandler {
    obj: ScreenObject;

    constructor(obj: ScreenObject) {
        this.obj = obj;
    }
    draw(canvasCtx: CanvasRenderingContext2D) {}

    // private

    mouseMoveHandle(cursorPos: ScreenPoint) { }
    mouseDownHandle(cursorPos: ScreenPoint) { }
    mouseUpHandle(cursorPos: ScreenPoint) { }
}

class VectorEndHandler extends ScreenObjectHandler {
    style: HandlerStyle = vectorHandlerStyle;
    state: HandleState = HandleState.None;

    Update(cursorPos: ScreenPoint) {

    }

    draw(canvasCtx: CanvasRenderingContext2D) {
        const vObj = this.obj as VectorObject;
        this.drawHandler(canvasCtx, vObj.head, this.state);
    }

    drawHandler(canvasCtx: CanvasRenderingContext2D, pos: ScreenPoint, state: HandleState) {
        canvasCtx.save();
        canvasCtx.beginPath();
        canvasCtx.arc(pos.x, pos.y, this.VECTOR_HANDLER_RADIUS_PX, 0, Math.PI * 2);

        switch (state) {
            case HandleState.Dragging: {
                canvasCtx.fillStyle = vectorHandlerStyle.draggingColor;
                break;
            }
            case HandleState.Hovered: {
                canvasCtx.fillStyle = vectorHandlerStyle.hoveredColor;
                break;
            }
            default: {
                canvasCtx.fillStyle = vectorHandlerStyle.color;
            }
        }
        canvasCtx.fill();
        canvasCtx.restore();
    }

    mouseMoveHandle(cursorPos: ScreenPoint) {
        if (this.state === HandleState.Dragging) {
            this.drag(cursorPos);
            return;
        }

        const vObj = this.obj as VectorObject;
        const isCursorNear = dist2(cursorPos, vObj.head) < this.HIT_RADIUS_PX * this.HIT_RADIUS_PX;

        if (this.state === HandleState.None && isCursorNear) {
            this.setState(HandleState.Hovered);
            return;
        }

        if (this.state === HandleState.Hovered && !isCursorNear) {
            this.setState(HandleState.None);
            return;
        }
    }
    mouseDownHandle(cursorPos: ScreenPoint) { }
    mouseUpHandle(cursorPos: ScreenPoint) { }

    // private

    private readonly HIT_RADIUS_PX = 10;
    private readonly VECTOR_HANDLER_RADIUS_PX = 3;

    private drag(pos: ScreenPoint) {

    }

    private setState(state: HandleState) {
        this.state = state;
    }
}


abstract class ScreenObject {
    id: string;
    handlers: Array<ScreenObjectHandler> = new Array<ScreenObjectHandler>();
    style?: Style;

    constructor() {
        this.id = "ScreenObj" + crypto.randomUUID();
    }

    isCursorNear(p: ScreenPoint): boolean { return false };
    draw(canvas: HTMLCanvasElement, canvasCtx: CanvasRenderingContext2D) { /* Add error message */ }

    mouseMoveHandle(cursorPos: ScreenPoint) {
        for(const h of this.handlers) {
            h.mouseMoveHandle(cursorPos);
        }
    }

    mouseDownHandle(cursorPos: ScreenPoint) {
        for(const h of this.handlers) {
            h.mouseDownHandle(cursorPos);
        }
    }

    mouseUpHandle(cursorPos: ScreenPoint) {
        for(const h of this.handlers) {
            h.mouseUpHandle(cursorPos);
        }
    }
}

class VectorObject extends ScreenObject {
    tail: ScreenPoint; // starting point
    head: ScreenPoint; // endging point

    constructor(tail: ScreenPoint, head: ScreenPoint) {
        super();
        this.tail = tail;
        this.head = head;
    }

    draw(canvas: HTMLCanvasElement, canvasCtx: CanvasRenderingContext2D) {
        assert(dist(this.tail, this.head) > Number.EPSILON, "Can't draw zero vector!");

        drawSegmentByTwoScreenPoints(canvas, canvasCtx, this.tail, this.head, basisVectorStyle);
        drawArrowHeadfunction(canvas, canvasCtx, this.head, new ScreenVector(this.head.x - this.tail.x, this.head.y - this.tail.y), basisVectorStyle);
    }

    mouseMoveHandle(cursorPos: ScreenPoint) {
        super.mouseMoveHandle(cursorPos);
    }
    mouseDownHandle(cursorPos: ScreenPoint) {
        super.mouseDownHandle(cursorPos);
    }
    mouseUpHandle(cursorPos: ScreenPoint) {
        super.mouseUpHandle(cursorPos);
    }

}

class BasisVectorObject extends VectorObject {
    constructor(tail: ScreenPoint, head: ScreenPoint) {
        super(tail, head);

        this.handlers.push(new VectorEndHandler(this));
    }

    draw(canvas: HTMLCanvasElement, canvasCtx: CanvasRenderingContext2D) {
        super.draw(canvas, canvasCtx);
        this.drawHandlers(canvasCtx);
    }

    private drawHandlers(canvasCtx: CanvasRenderingContext2D) {
        for(const handler of this.handlers) {
            handler.draw(canvasCtx);
        }
    }
}

class AxisObject extends ScreenObject {
    origin: ScreenPoint;
    e: ScreenVector;

    constructor(origin: ScreenPoint, e: ScreenVector) {
        super();

        this.origin = origin;
        this.e = e;
    }

    draw(canvas: HTMLCanvasElement, canvasCtx: CanvasRenderingContext2D) {
        drawLine(canvas, canvasCtx, this.origin, this.e, axisLineStyle);
    }
}

class GridObject extends ScreenObject {
    origin: ScreenPoint;
    e1: ScreenVector;
    e2: ScreenVector;

    constructor(origin: ScreenPoint, e1: ScreenVector, e2: ScreenVector) {
        super();

        this.origin = origin;
        this.e1 = e1;
        this.e2 = e2;
    }

    draw(canvas: HTMLCanvasElement, canvasCtx: CanvasRenderingContext2D): void {
        canvasCtx.beginPath();

        let floatPoint: ScreenPoint = this.origin.copy();

        drawLine(canvas, canvasCtx, this.origin, this.e1, gridLineStyle);

        while (screenToPointsConverter.isScreenPointInCanvas(canvas, floatPoint)) {
            drawLine(canvas, canvasCtx, floatPoint, this.e2, gridLineStyle);
            floatPoint = floatPoint.addVector(this.e1);
        }

        const e1Negative = this.e1.copy().scale(-1);
        const e2Negative = this.e2.copy().scale(-1);
        floatPoint.set(this.origin.x, this.origin.y);
        while (screenToPointsConverter.isScreenPointInCanvas(canvas, floatPoint)) {
            drawLine(canvas, canvasCtx, floatPoint, this.e2, gridLineStyle);
            floatPoint = floatPoint.addVector(e1Negative);
        }

        floatPoint.set(this.origin.x, this.origin.y);
        while (screenToPointsConverter.isScreenPointInCanvas(canvas, floatPoint)) {
            drawLine(canvas, canvasCtx, floatPoint, this.e1, gridLineStyle);
            floatPoint = floatPoint.addVector(this.e2);
        }

        floatPoint.set(this.origin.x, this.origin.y);
        while (screenToPointsConverter.isScreenPointInCanvas(canvas, floatPoint)) {
            drawLine(canvas, canvasCtx, floatPoint, this.e1, gridLineStyle);
            floatPoint = floatPoint.addVector(e2Negative);
        }

        canvasCtx.stroke();
    }

}

class PointObject extends ScreenObject {

}

class OriginObject extends PointObject {

}


function drawSegmentByTwoScreenPoints(
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

function drawArrowHeadfunction(
    canvas: HTMLCanvasElement,
    canvasCtx: CanvasRenderingContext2D,
    p: ScreenPoint,
    dir: ScreenVector,
    style: VectorStyle,
) {
    assert(!isVectorZero(dir), "Direction has to be non zero vector!");

    dir.normalize();
    dir.scale(-style.arrowSizePix);

    const v1 = rotateVector(dir, style.arrowAngleRad);
    const v2 = rotateVector(dir, -style.arrowAngleRad);

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


/**
 * Draw line through the point with the direction
 */
function drawLine(
    canvas: HTMLCanvasElement,
    canvasCtx: CanvasRenderingContext2D,
    p: ScreenPoint,
    v: ScreenVector,
    style: LineStyle,
) {
    assert(!isVectorZero(v), "Direction has to be non zero vector!");

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