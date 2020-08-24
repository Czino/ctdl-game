const WORLD = { w: 1024, h: 1024 }
const WIDTH = 128 // viewport
const HEIGHT = 256 // viewport
const START = { x: 512, y: 1024 - HEIGHT }

const gameCanvas = document.getElementById('ctdl-game')
gameCanvas.width = WIDTH
gameCanvas.height = HEIGHT

const charCanvas = document.getElementById('ctdl-game-chars')
charCanvas.width = WIDTH
charCanvas.height = HEIGHT

const overlayCanvas = document.getElementById('ctdl-game-overlay')
overlayCanvas.width = WIDTH
overlayCanvas.height = HEIGHT
const gameContext = gameCanvas.getContext('2d')
const charContext = charCanvas.getContext('2d')
const overlayContext = overlayCanvas.getContext('2d')

gameContext.imageSmoothingEnabled = false
charContext.imageSmoothingEnabled = false
overlayContext.imageSmoothingEnabled = false

gameContext.translate(-START.x, -START.y)
charContext.translate(-START.x, -START.y)
overlayContext.translate(-START.x, -START.y)

export default {
  WIDTH,
  HEIGHT,
  WORLD,
  START,
  CHECKBLOCKTIME: 1000 * 60 * 2, // 2 minutues
  GROUNDHEIGHT: 7,
  FRAMERATE: 8, // render every X frame
  GRAVITY: 2,
  gameContext,
  charContext,
  overlayContext
}