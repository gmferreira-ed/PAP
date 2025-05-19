export class Vector2 {
  X: number = 0;
  Y: number = 0;

  constructor(X?: number, Y?: number) {
    if (X) this.X = X
    if (Y) this.Y = Y
  }

  equals(Vector:Vector2):boolean{
    return Vector.X == this.X && Vector.Y == this.Y
  }
}
