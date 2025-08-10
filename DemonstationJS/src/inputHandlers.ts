import { ScreenPoint } from "./screenPoints";


export function mouseMoveHandle(e: MouseEvent) {
    
}

export function mouseDownHandle(e: MouseEvent) {
    const mousePos = new ScreenPoint(e.offsetX, e.offsetY);
}