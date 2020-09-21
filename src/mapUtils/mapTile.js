export const mapTile = (tile, tileSize) => {
  return {
    ...tile,
    tile: tile.tile.map(coord => coord * tileSize),
    x: tile.x * tileSize,
    y: tile.y * tileSize + 2,
    w: tileSize,
    h: tileSize,
    getBoundingBox: () => ({
      x: tile.x * tileSize,
      y: tile.y * tileSize + 2,
      w: tileSize,
      h: tileSize
    })
  }
}

export default mapTile