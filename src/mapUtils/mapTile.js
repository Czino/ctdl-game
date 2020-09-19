export const mapTile = (tile, tileSize) => ({
  x: tile.x * tileSize,
  y: tile.y * tileSize + 2,
  tile: tile.tile.map(coord => coord * tileSize),
  w: tileSize,
  h: tileSize
})

export default mapTile