import type { Grid } from "./Grid";
import Coordinates from "./Coordinates";

export interface Transform {
  slug: string;
  transformGrid(grid: Grid): Grid;
  transformCoordinates(before: Coordinates): Coordinates;
}

class Rotate implements Transform {
  rotations = 1;
  slug: string;

  constructor(rotations: number = 1) {
    this.slug = `r${rotations}`;
    this.rotations = rotations;
  }

  static transformGridOnce(grid: Grid): Grid {
    return [
      [grid[2][0], grid[1][0], grid[0][0]],
      [grid[2][1], grid[1][1], grid[0][1]],
      [grid[2][2], grid[1][2], grid[0][2]],
    ];
  }

  static transformCoordinatesOnce(coordinates: Coordinates): Coordinates {
    return new Coordinates(coordinates.col, 2 - coordinates.row);
  }

  transformGrid(grid: Grid): Grid {
    let newGrid = grid;

    for (let i = 0; i < this.rotations; i++) {
      newGrid = Rotate.transformGridOnce(newGrid);
    }

    return newGrid;
  }

  transformCoordinates(coordinates: Coordinates): Coordinates {
    let newCoordinates = coordinates;

    for (let i = 0; i < this.rotations; i++) {
      newCoordinates = Rotate.transformCoordinatesOnce(newCoordinates);
    }

    return newCoordinates;
  }
}

class Flip implements Transform {
  rotations: number = 0;
  slug: string;

  constructor(rotations: number = 0) {
    this.slug = "f" + (rotations > 0 ? "r" + rotations++ : "");
    this.rotations = rotations;
  }

  transformGrid(grid: Grid): Grid {
    let newGrid = grid.map((row) => row.slice().reverse());

    for (let i = 0; i < this.rotations; i++) {
      newGrid = Rotate.transformGridOnce(newGrid);
    }

    return newGrid;
  }
  transformCoordinates(coordinates: Coordinates): Coordinates {
    let newCoordinates = new Coordinates(2 - coordinates.row, coordinates.col);

    for (let i = 0; i < this.rotations; i++) {
      newCoordinates = Rotate.transformCoordinatesOnce(newCoordinates);
    }

    return newCoordinates;
  }
}

export const TRANSFORMS: Transform[] = [
  new Rotate(),
  new Rotate(2),
  new Rotate(3),

  new Flip(),
  new Flip(1),
  new Flip(2),
  new Flip(3),
];
