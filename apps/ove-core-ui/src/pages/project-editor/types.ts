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

export type DataType = {
  name: string
  displayName: string
  color: string
  extensions: string[]
}
