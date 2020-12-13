let stage = {
  parallax: [],
  bg: [],
  base: [],
  fg: []
}

stage.base = stage.base.map((row, y) => row.map((tile, x) => {
  if (tile.join && tile.join() === '1,0') {
      stage.bg[y][x] = tile
      return 0
  }
  return tile
}))