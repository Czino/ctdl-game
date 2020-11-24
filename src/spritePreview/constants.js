const baseCanvas = document.getElementById('ctdl-game-base')

baseCanvas.width = 128
baseCanvas.height = 128

const baseContext = baseCanvas.getContext('2d')
baseContext.imageSmoothingEnabled = false

export default {
  FRAMERESET: Math.pow(2, 64),
  FRAMERATE: 8, // render every X frame
  canvases: [
    baseCanvas,
  ],
  contexts: [
    baseContext,
  ],
  baseCanvas,
  baseContext
}