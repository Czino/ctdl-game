const WORLD = { w: 1000, h: 1024 }
const WIDTH = 128 // viewport
const HEIGHT = 256 // viewport
const START = { x: 512, y: 1024 - HEIGHT, w: WIDTH, h: HEIGHT }
const MENU = { w: WIDTH, h: 64 }
const TEXTBOX = { x: 0, y: HEIGHT - MENU.h + 24, w: WIDTH }

const skyCanvas = document.getElementById('ctdl-game-sky')

const parallaxCanvas = document.getElementById('ctdl-game-parallax')
const bgCanvas = document.getElementById('ctdl-game-bg')
const gameCanvas = document.getElementById('ctdl-game')
const charCanvas = document.getElementById('ctdl-game-chars')
const fgCanvas = document.getElementById('ctdl-game-fg')
const overlayCanvas = document.getElementById('ctdl-game-overlay')
const menuCanvas = document.getElementById('ctdl-game-menu')
const helperCanvas = document.getElementById('ctdl-game-helper');

[
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
const helperContext = helperCanvas.getContext('2d');

[
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
  hodlonaut: {
    e: 'attack',
    w: 'back',
    a: 'moveLeft',
    s: null,
    d: 'moveRight',
    q: 'jump'
  },
  katoshi: {
    u: 'attack',
    i: 'back',
    j: 'moveLeft',
    k: null,
    l: 'moveRight',
    o: 'jump',
  },
  buttons: {
    attack: 'attack',
    back: 'back',
    switch: 'switch',
    moveLeft: 'moveLeft',
    moveRight: 'moveRight',
    jump: 'jump'
  }
}

let BUTTONS = []

export default {
  SLOT: '-new',
  WIDTH,
  HEIGHT,
  WORLD,
  START,
  MENU,
  TEXTBOX,
  FRAMESINADAY: Math.pow(2, 14),
  FRAMERESET: Math.pow(2, 64),
  CHECKBLOCKTIME: Math.pow(2, 11), // check every X frame
  GROUNDHEIGHT: 6,
  FRAMERATE: 8, // render every X frame
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
  skyCanvas,
  skyContext,
  parallaxCanvas,
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
  helperContext,
  CONTROLS,
  BUTTONS,
  SPAWNRATES: { // TODO move to individal map
    shitcoiner: {
      city: .01
    },
    rabbit: {
      forest: .005
    }
  }
}