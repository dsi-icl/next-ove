export type Rect = {
  width: number
  height: number
}

export type Space = Rect & {
  columns: number
  rows: number
}

export type Geometry = Rect & {
  x: number
  y: number
}
