const WORLD = { w: 1000, h: 1024 }
const WIDTH = 128 // viewport
const HEIGHT = 256 // viewport
const START = { x: 512, y: 1024 - HEIGHT, w: WIDTH, h: HEIGHT }
const MENU = { w: WIDTH, h: 64 }
const TEXTBOX = { x: 0, y: HEIGHT - MENU.h + 24, w: WIDTH }

const skyCanvas = document.getElementById('ctdl-game-sky')
skyCanvas.width = WIDTH
skyCanvas.height = HEIGHT

const parallaxCanvas = document.getElementById('ctdl-game-parallax')
parallaxCanvas.width = WIDTH
parallaxCanvas.height = HEIGHT

const bgCanvas = document.getElementById('ctdl-game-bg')
bgCanvas.width = WIDTH
bgCanvas.height = HEIGHT

const gameCanvas = document.getElementById('ctdl-game')
gameCanvas.width = WIDTH
gameCanvas.height = HEIGHT

const charCanvas = document.getElementById('ctdl-game-chars')
charCanvas.width = WIDTH
charCanvas.height = HEIGHT

const fgCanvas = document.getElementById('ctdl-game-fg')
fgCanvas.width = WIDTH
fgCanvas.height = HEIGHT

const overlayCanvas = document.getElementById('ctdl-game-overlay')
overlayCanvas.width = WIDTH
overlayCanvas.height = HEIGHT

const menuCanvas = document.getElementById('ctdl-game-menu')
menuCanvas.width = WIDTH
menuCanvas.height = HEIGHT

const skyContext = skyCanvas.getContext('2d')
const parallaxContext = parallaxCanvas.getContext('2d')
const bgContext = bgCanvas.getContext('2d')
const gameContext = gameCanvas.getContext('2d')
const fgContext = fgCanvas.getContext('2d')
const charContext = charCanvas.getContext('2d')
const overlayContext = overlayCanvas.getContext('2d')
const menuContext = menuCanvas.getContext('2d')

skyContext.imageSmoothingEnabled = false
parallaxContext.imageSmoothingEnabled = false
bgContext.imageSmoothingEnabled = false
gameContext.imageSmoothingEnabled = false
fgContext.imageSmoothingEnabled = false
charContext.imageSmoothingEnabled = false
overlayContext.imageSmoothingEnabled = false
menuContext.imageSmoothingEnabled = false

skyContext.translate(-START.x, -START.y)
parallaxContext.translate(-START.x, -START.y)
bgContext.translate(-START.x, -START.y)
gameContext.translate(-START.x, -START.y)
fgContext.translate(-START.x, -START.y)
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
  {
    action: 'loadGame',
    x: WIDTH / 2 - 41,
    y: HEIGHT / 2 + 20,
    w: 80,
    h: 10,
    active: false
  },
  {
    action: 'newGame',
    x: WIDTH / 2 - 35,
    y: HEIGHT / 2,
    w: 60,
    h: 10,
    active: true
  },
  {
    action: 'music',
    x: WIDTH - 3 - 9 - 11,
    y: 3,
    w: 9,
    h: 9,
    active: true
  },
  {
    action: 'sound',
    x: WIDTH - 3 - 9 ,
    y: 3,
    w: 9,
    h: 9,
    active: true
  },
  { action: 'jump', x: 21 * 4, y: HEIGHT - 20, w: 18, h: 18, active: false},
  { action: 'attack', x: 21 * 5, y: HEIGHT - 20, w: 18, h: 18, active: false},
  { action: 'moveLeft', x: 0, y: HEIGHT - 20, w: 18, h: 18, active: false},
  { action: 'moveRight', x: 21, y: HEIGHT - 20, w: 18, h: 18, active: false},
  { action: 'back', x: 21 * 2, y: HEIGHT - 20, w: 18, h: 18, active: false}
]
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
  skyCanvas,
  skyContext,
  parallaxCanvas,
  parallaxContext,
  bgContext,
  gameContext,
  fgContext,
  charContext,
  overlayContext,
  menuContext,
  CONTROLS,
  BUTTONS,
  SPAWNRATES: {
    shitcoiner: .01
  }
}