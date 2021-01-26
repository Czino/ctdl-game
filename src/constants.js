const WIDTH = 32 // viewport
const HEIGHT = 18 // viewport
const START = { x: 512, y: 1024 - HEIGHT, w: WIDTH, h: HEIGHT }
const MENU = { x: 0, y: HEIGHT - 64, w: WIDTH, h: 0 }
const TEXTBOX = { x: 0, y: HEIGHT - MENU.h + 24, w: WIDTH }

const skyCanvas = document.getElementById('ctdl-game-sky')
const parallaxCanvas = document.getElementById('ctdl-game-parallax')
const bgCanvas = document.getElementById('ctdl-game-bg')
const gameCanvas = document.getElementById('ctdl-game')
const charCanvas = document.getElementById('ctdl-game-chars')
const fgCanvas = document.getElementById('ctdl-game-fg')
const overlayCanvas = document.getElementById('ctdl-game-overlay')
const menuCanvas = document.getElementById('ctdl-game-menu')
const helperCanvas = document.getElementById('ctdl-game-helper')

;[
  skyCanvas,
  parallaxCanvas,
  bgCanvas,
  gameCanvas,
  charCanvas,
  fgCanvas,
  overlayCanvas,
  menuCanvas
].forEach(canvas => {
  canvas.width = WIDTH
  canvas.height = HEIGHT
  canvas.style.height = (Math.round(window.innerHeight / 2) * 2) + 'px'
})

helperCanvas.width = 16
helperCanvas.height = 16

const skyContext = skyCanvas.getContext('2d')
const parallaxContext = parallaxCanvas.getContext('2d')
const bgContext = bgCanvas.getContext('2d')
const gameContext = gameCanvas.getContext('2d')
const fgContext = fgCanvas.getContext('2d')
const charContext = charCanvas.getContext('2d')
const overlayContext = overlayCanvas.getContext('2d')
const menuContext = menuCanvas.getContext('2d')
const helperContext = helperCanvas.getContext('2d')

;[
  skyContext,
  parallaxContext,
  bgContext,
  gameContext,
  fgContext,
  charContext,
  overlayContext,
  menuContext
].forEach(context => {
  context.imageSmoothingEnabled = false
  context.translate(-START.x, -START.y)
})

const CONTROLS = {
  singlePlayer: {
    q: 'jump',
    ' ': 'jump',
    e: 'attack',
    enter: 'attack',
    s: 'duck',
    w: 'back',
    a: 'moveLeft',
    d: 'moveRight'
  },
  hodlonaut: {
    q: 'jump',
    e: 'attack',
    s: 'duck',
    w: 'back',
    a: 'moveLeft',
    d: 'moveRight',
  },
  katoshi: {
    o: 'jump',
    u: 'attack',
    k: 'duck',
    i: 'back',
    j: 'moveLeft',
    l: 'moveRight'
  },
  buttons: {
    jump: 'jump',
    attack: 'attack',
    back: 'back',
    duck: 'duck',
    switch: 'switch',
    moveLeft: 'moveLeft',
    moveRight: 'moveRight'
  }
}

let BUTTONS = []

export default {
  SLOT: '',
  WIDTH,
  HEIGHT,
  START,
  MENU,
  TEXTBOX,
  FRAMESINADAY: Math.pow(2, 14),
  FRAMERESET: Math.pow(2, 64),
  CHECKBLOCKTIME: Math.pow(2, 12), // check every X frame
  FRAMERATE: 4, // render every X frame
  FRAMERATES: {
    skyContext: 4,
    parallaxContext: 4,
    bgContext: 4,
    charContext: 4,
    gameContext: 4,
    fgContext: 4,
    overlayContext: 4,
    menuContext: 4
  },
  SAVERATE: Math.pow(2, 12), // render every X frame
  GRAVITY: 2,
  canvases: [
    skyCanvas,
    parallaxCanvas,
    bgCanvas,
    gameCanvas,
    charCanvas,
    fgCanvas,
    overlayCanvas,
    menuCanvas
  ],
  skyContext, // TODO use .canvases and .contexts ?
  parallaxContext,
  bgCanvas,
  bgContext,
  gameCanvas,
  gameContext,
  fgCanvas,
  fgContext,
  charCanvas,
  charContext,
  overlayCanvas,
  overlayContext,
  menuContext,
  helperCanvas,
  helperContext,
  CONTROLS,
  BUTTONS
}