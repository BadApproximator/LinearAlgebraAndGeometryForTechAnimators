// ----- Algebraical and Geometrical Objects ----- //

type R = number

export class Point2D {
    x: R = 0;
    y: R = 0;

    constructor(x: R = 0, y: R = 0) {
        this.x = x;
        this.y = y;
    }

    copy(): Point2D {
        return new Point2D(this.x, this.y);
    }

    set(x: R, y: R) {
        this.x = x;
        this.y = y;
    }
}

export class Vector2D {
    x: R;
    y: R;

    constructor(vectorSpace: VectorSpace, x: R = 0, y: R = 0) {
        this.vectorSpace = vectorSpace;
        this.x = x;
        this.y = y;
    }

    copy(): Vector2D {
        return new Vector2D(this.vectorSpace, this.x, this.y);
    }

    private vectorSpace: VectorSpace;
}

export class Basis {
    e1: Vector2D;
    e2: Vector2D;

    constructor(e1: Vector2D, e2: Vector2D) {
        this.e1 = e1;
        this.e2 = e2;
    }
}

export class VectorSpace {
    
    constructor(basis: Basis = new Basis(new Vector2D(this, 1, 0), new Vector2D(this, 0, 1))) {
        this.basis = basis;
    }

    getBasis() : Basis {
        return this.basis;
    }

    add(v1: Vector2D, v2: Vector2D): Vector2D {
        return new Vector2D(this, v1.x + v2.x, v1.y + v2.y);
    }

    scale(v: Vector2D, lambda: number): Vector2D {
        return new Vector2D(this, v.x * lambda, v.y * lambda);
    }

// private

    private basis: Basis;
}

// In common, Affine Space is pair (A, V) with operations, where A - set of points, V - vector space,
// but in our case, A is set of screen pixels, so we shouldn't point it explicitly.
export class AffineSpace {
    
    constructor(vSpace: VectorSpace = new VectorSpace()) {
        this.vSpace = vSpace;
    }

    getBasis(): Basis {
        return this.vSpace.getBasis();
    }

    getVectorSpace(): VectorSpace {
        return this.vSpace;
    }

    addVectorToPoint(p: Point2D, v: Vector2D): Point2D {
        return new Point2D(p.x + v.x, p.y + v.y);
    }

// private

    private vSpace: VectorSpace;
}

export class CoordinateSystem2D {

    constructor(affineSpace: AffineSpace = new AffineSpace(), origin: Point2D = new Point2D()) {
        this.affineSpace = affineSpace;
        this.origin = origin;
    }

    public getBasis(): Basis {
        return this.affineSpace.getBasis();
    }

    public getOrigin(): Point2D {
        return this.origin;
    }

    public getAffineSpace(): AffineSpace {
        return this.affineSpace;
    }

    public getRadiusVector(p: Point2D): Vector2D {
        return new Vector2D(this.affineSpace.getVectorSpace(), p.x, p.y);
    }

    public getPointByRadiusVector(v: Vector2D): Point2D {
        return new Point2D(v.x, v.y);
    }

    public movePointAtOrigin(p: Point2D) {
        p.x = this.origin.x;
        p.y = this.origin.y;
    }

// private

    private affineSpace: AffineSpace;
    private origin:      Point2D;     // some point in Affine Space
}