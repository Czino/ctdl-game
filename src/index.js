import { QuadTree, Boundary } from './quadTree'
import Character from './character'
import Block from './block'
import initEvents, { updateOverlay } from './events'
import constants from './constants'
import { assets, loadAsset, showProgressBar } from './gameUtils'

window.KEYS = []
window.SELECTED = null
const objects = []

let frame = 0
window.
window.CTDLGAME = {
  cursor: {x: 0, y: 0},
  assets,
  objects: [],
  quadTree: new QuadTree(new Boundary({
    x: 0,
    y: 0,
    w: constants.WIDTH,
    h: constants.HEIGHT
  }))
}
const ground = new Block('ground', constants.gameContext, CTDLGAME.quadTree, {
  x: 0,
  y: constants.HEIGHT - constants.GROUNDHEIGHT,
  w: constants.WIDTH,
  h: constants.GROUNDHEIGHT,
  isStatic: true,
  isSolid: true
})
const hodlonaut = new Character(
  'hodlonaut',
  constants.charContext,
  CTDLGAME.quadTree,
  {
    x: 1,
    y: constants.HEIGHT - constants.GROUNDHEIGHT - 30
  }
)
const katoshi = new Character(
  'katoshi',
  constants.charContext,
  CTDLGAME.quadTree,
  {
    active: false,
    x: constants.WIDTH / 2,
    y: constants.HEIGHT - constants.GROUNDHEIGHT - 30
  }
)

CTDLGAME.objects.push(ground)
CTDLGAME.objects.push(hodlonaut)
CTDLGAME.objects.push(katoshi)

init()

async function init() {
  let i = 0
  for (let key in CTDLGAME.assets) {
    CTDLGAME.assets[key] = await loadAsset(CTDLGAME.assets[key])
    constants.overlayContext.clearRect(0, 0, constants.WIDTH, constants.HEIGHT)

    showProgressBar(i / (Object.keys(CTDLGAME.assets).length - 1))
    i++
  }
  initEvents()

  hodlonaut.select()
  katoshi.direction = 'left'
  CTDLGAME.objects.forEach(object => CTDLGAME.quadTree.insert(object))
  CTDLGAME.objects.forEach(object => object.update())

  constants.overlayContext.clearRect(0, 0, constants.WIDTH, constants.HEIGHT)

  tick()
}
async function tick() {
  if (frame % constants.FRAMERATE === 0) {
    constants.charContext.clearRect(0, 0, constants.WIDTH, constants.HEIGHT)

    // apply gravity
    hodlonaut.vy += constants.GRAVITY
    katoshi.vy += constants.GRAVITY

    CTDLGAME.objects.forEach(object => object.update())
    updateOverlay()
    // window.SHOWQUAD = true
    // blocks = blocks.map(block => moveBlock(block, {x: 0, y: 1}))
    CTDLGAME.quadTree.clear()
    if (window.SHOWQUAD) constants.gameContext.clearRect(0, 0, constants.WIDTH, constants.HEIGHT)
    CTDLGAME.quadTree.insert(hodlonaut)
    CTDLGAME.quadTree.insert(katoshi)
    CTDLGAME.objects.forEach(object => CTDLGAME.quadTree.insert(object))
    if (window.SHOWQUAD) CTDLGAME.quadTree.show(constants.gameContext)
  }

  frame++
  window.requestAnimationFrame(tick)
}