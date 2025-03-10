import type { Grid } from "./Grid";
import Coordinates from "./Coordinates";

export interface Transform {
  transformGrid(grid: Grid): Grid;
  transformCoordinates(before: Coordinates): Coordinates;

  performGridTransformation(grid: Grid): Grid;
  performCoordinatesTransformation(coordinates: Coordinates): Coordinates;
}

export class AsIs implements Transform {
  transforms: Transform[] = [];

  constructor(transforms?: Transform) {
    this.transforms = transforms ? [transforms] : [];
  }

  transformGrid(grid: Grid): Grid {
    this.transforms.forEach((transform) => {
      grid = transform.performGridTransformation(grid);
    });

    return grid;
  }

  transformCoordinates(coordinates: Coordinates): Coordinates {
    this.transforms.forEach((transform) => {
      coordinates = transform.performCoordinatesTransformation(coordinates);
    });

    return coordinates;
  }

  performGridTransformation(grid: Grid): Grid {
    return grid;
  }

  performCoordinatesTransformation(coordinates: Coordinates): Coordinates {
    return coordinates;
  }
}

export class Flip extends AsIs {
  constructor(transforms?: Transform) {
    super(transforms);
    this.transforms.push(this);
  }

  performGridTransformation(grid: Grid): Grid {
    return grid.map((row) => row.slice().reverse());
  }
  performCoordinatesTransformation(coordinates: Coordinates): Coordinates {
    return new Coordinates(2 - coordinates.row, coordinates.col);
  }
}

export class Rotate extends AsIs {
  constructor(transforms?: Transform) {
    super(transforms);
    this.transforms.push(this);
  }

  performGridTransformation(grid: Grid): Grid {
    return [
      [grid[2][0], grid[1][0], grid[0][0]],
      [grid[2][1], grid[1][1], grid[0][1]],
      [grid[2][2], grid[1][2], grid[0][2]],
    ];
  }

  performCoordinatesTransformation(coordinates: Coordinates): Coordinates {
    return new Coordinates(coordinates.col, 2 - coordinates.row);
  }
}
