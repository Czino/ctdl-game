const WIDTH = 128
const HEIGHT = 256

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

export default {
  WIDTH,
  HEIGHT,
  CHECKBLOCKTIME: 1000 * 60 * 2, // 2 minutues
  GROUNDHEIGHT: 7,
  FRAMERATE: 8, // render every X frame
  GRAVITY: 2,
  gameContext,
  charContext,
  overlayContext
}