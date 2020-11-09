const parallaxCanvas = document.getElementById('ctdl-game-parallax')
const bgCanvas = document.getElementById('ctdl-game-bg')
const fgCanvas = document.getElementById('ctdl-game-fg')
const menuCanvas = document.getElementById('ctdl-game-menu')
const helperCanvas = document.getElementById('ctdl-game-helper')

menuCanvas.width = 80
menuCanvas.height = 160
helperCanvas.width = 8
helperCanvas.height = 8

;[
  parallaxCanvas,
  bgCanvas,
  fgCanvas
].forEach(canvas => {
  canvas.width = canvas.clientHeight
  canvas.height = canvas.clientHeight
})

helperCanvas.width = 16
helperCanvas.height = 16

const parallaxContext = parallaxCanvas.getContext('2d')
const bgContext = bgCanvas.getContext('2d')
const fgContext = fgCanvas.getContext('2d')
const menuContext = menuCanvas.getContext('2d')
const helperContext = helperCanvas.getContext('2d')

;[
  parallaxContext,
  bgContext,
  fgContext,
  menuContext,
  helperContext
].forEach(context => {
  context.imageSmoothingEnabled = false
})

export default {
  FRAMERESET: Math.pow(2, 64),
  FRAMERATE: 8, // render every X frame
  canvases: [
    parallaxCanvas,
    bgCanvas,
    fgCanvas,
    menuCanvas
  ],
  contexts: [
    bgContext,
    fgContext,
    menuContext,
    helperContext
  ],
  parallaxContext,
  parallaxCanvas,
  bgCanvas,
  bgContext,
  fgCanvas,
  fgContext,
  menuCanvas,
  menuContext,
  helperCanvas,
  helperContext
}