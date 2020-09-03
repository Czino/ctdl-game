const WORLD = { w: 1024, h: 1024 }
const WIDTH = 128 // viewport
const HEIGHT = 256 // viewport
const START = { x: 512, y: 1024 - HEIGHT }
const MENU = { w: WIDTH, h: 64 }
const TEXTBOX = { x: 0, y: HEIGHT - MENU.h + 26, w: WIDTH }
const gameCanvas = document.getElementById('ctdl-game')
gameCanvas.width = WIDTH
gameCanvas.height = HEIGHT

const charCanvas = document.getElementById('ctdl-game-chars')
charCanvas.width = WIDTH
charCanvas.height = HEIGHT

const overlayCanvas = document.getElementById('ctdl-game-overlay')
overlayCanvas.width = WIDTH
overlayCanvas.height = HEIGHT

const menuCanvas = document.getElementById('ctdl-game-menu')
menuCanvas.width = WIDTH
menuCanvas.height = HEIGHT

const gameContext = gameCanvas.getContext('2d')
const charContext = charCanvas.getContext('2d')
const overlayContext = overlayCanvas.getContext('2d')
const menuContext = menuCanvas.getContext('2d')

gameContext.imageSmoothingEnabled = false
charContext.imageSmoothingEnabled = false
overlayContext.imageSmoothingEnabled = false
menuContext.imageSmoothingEnabled = false

gameContext.translate(-START.x, -START.y)
charContext.translate(-START.x, -START.y)
overlayContext.translate(-START.x, -START.y)
menuContext.translate(-START.x, -START.y)

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
    moveLeft: 'moveLeft',
    moveRight: 'moveRight',
    jump: 'jump'
  }
}
const BUTTONS = [
  { action: 'jump', x: 21 * 4, y: HEIGHT - 20, w: 18, h: 18},
  { action: 'attack', x: 21 * 5, y: HEIGHT - 20, w: 18, h: 18},
  { action: 'moveLeft', x: 0, y: HEIGHT - 20, w: 18, h: 18},
  { action: 'moveRight', x: 21, y: HEIGHT - 20, w: 18, h: 18},
  { action: 'back', x: 21 * 2, y: HEIGHT - 20, w: 18, h: 18},
]
export default {
  WIDTH,
  HEIGHT,
  WORLD,
  START,
  MENU,
  TEXTBOX,
  FRAMESINADAY: Math.pow(2, 14),
  FRAMERESET: Math.pow(2, 16),
  CHECKBLOCKTIME: Math.pow(2, 12), // check every X frame
  GROUNDHEIGHT: 6,
  FRAMERATE: 8, // render every X frame
  SAVERATE: Math.pow(2, 12), // render every X frame
  GRAVITY: 2,
  gameCanvas,
  gameContext,
  charContext,
  overlayContext,
  menuContext,
  CONTROLS,
  BUTTONS,
  SPAWNRATES: {
    shitcoiner: .01
  }
}