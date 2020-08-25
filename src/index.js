import { QuadTree, Boundary } from './quadTree'
import Character from './character'
import Block from './block'
import initEvents, { updateOverlay } from './events'
import constants from './constants'
import { assets, loadAsset, showProgressBar, updateViewport, showInventory } from './gameUtils'
import { write } from './font'

window.KEYS = []
window.SELECTED = null

let frame = 0
window.
window.CTDLGAME = {
  cursor: {x: 0, y: 0},
  assets,
  world: constants.WORLD,
  viewport: constants.START,
  objects: [],
  blockHeight: 0,
  inventory: {
    blocks: []
  },
  quadTree: new QuadTree(new Boundary({
    x: 0,
    y: 0,
    ...constants.WORLD
  }))
}
const ground = new Block('ground', constants.gameContext, CTDLGAME.quadTree, {
  x: 0,
  y: CTDLGAME.world.h - constants.GROUNDHEIGHT - constants.MENU.h,
  w: CTDLGAME.world.w,
  h: constants.GROUNDHEIGHT * 2,
  isStatic: true,
  isSolid: true
})
const hodlonaut = new Character(
  'hodlonaut',
  constants.charContext,
  CTDLGAME.quadTree,
  {
    x: CTDLGAME.viewport.x + 1,
    y: CTDLGAME.world.h - constants.GROUNDHEIGHT  - constants.MENU.h - 30
  }
)
const katoshi = new Character(
  'katoshi',
  constants.charContext,
  CTDLGAME.quadTree,
  {
    active: false,
    x: CTDLGAME.viewport.x + constants.WIDTH / 2,
    y: CTDLGAME.world.h - constants.GROUNDHEIGHT - constants.MENU.h - 30
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
    constants.overlayContext.clearRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)

    showProgressBar(i / (Object.keys(CTDLGAME.assets).length - 1))
    i++
  }
  initEvents()
  hodlonaut.select()
  katoshi.direction = 'left'
  CTDLGAME.objects.forEach(object => CTDLGAME.quadTree.insert(object))
  CTDLGAME.objects.forEach(object => object.update())

  constants.overlayContext.clearRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)

  tick()
}
async function tick() {
  if (frame % constants.FRAMERATE === 0) {
    constants.gameContext.clearRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)
    constants.charContext.clearRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)
    constants.menuContext.clearRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)

    // apply gravity
    hodlonaut.vy += constants.GRAVITY
    katoshi.vy += constants.GRAVITY

    CTDLGAME.objects.forEach(object => object.update())
    CTDLGAME.viewport = {
      x: (hodlonaut.x + katoshi.x) / 2 - constants.WIDTH / 2,
      y: Math.min(
        constants.WORLD.h - constants.HEIGHT,
        (hodlonaut.y + katoshi.y) / 2)
    }
    updateViewport(CTDLGAME.viewport)
    updateOverlay()

    showInventory(CTDLGAME.inventory)

    // window.SHOWQUAD = true
    // blocks = blocks.map(block => moveBlock(block, {x: 0, y: 1}))
    CTDLGAME.quadTree.clear()
    if (window.SHOWQUAD) constants.gameContext.clearRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)
    CTDLGAME.objects.forEach(object => CTDLGAME.quadTree.insert(object))
    if (window.SHOWQUAD) CTDLGAME.quadTree.show(constants.gameContext)
  }

  frame++
  window.requestAnimationFrame(tick)
}