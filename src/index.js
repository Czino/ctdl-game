import { QuadTree, Boundary } from './quadTree'
import Character from './character'
import Block from './block'
import initEvents from './events'
import constants from './constants'

window.KEYS = []
window.SELECTED = null
const objects = []

let frame = 0
window.QUADTREE = new QuadTree(new Boundary({
  x: 0,
  y: 0,
  w: constants.WIDTH,
  h: constants.HEIGHT
}))
let ground = new Block('ground', constants.gameContext, QUADTREE, {
  x: 0,
  y: constants.HEIGHT - constants.GROUNDHEIGHT,
  w: constants.WIDTH,
  h: constants.GROUNDHEIGHT,
  isStatic: true,
  isSolid: true
})
window.CTDLGAME = {
  objects: [
    ground
  ]
}
const hodlonaut = new Character(
  'hodlonaut',
  constants.charContext,
  QUADTREE,
  {
    x: 0,
    y: constants.HEIGHT - constants.GROUNDHEIGHT - 30
  }
)
const katoshi = new Character(
  'katoshi',
  constants.charContext,
  QUADTREE,
  {
    active: false,
    x: constants.WIDTH / 2,
    y: constants.HEIGHT - constants.GROUNDHEIGHT - 30
  }
)

CTDLGAME.objects.push(hodlonaut)
CTDLGAME.objects.push(katoshi)

init()

async function init() {
  initEvents()

  for (let i in CTDLGAME.objects) {
    await CTDLGAME.objects[i].load()
  }

  hodlonaut.select()
  katoshi.direction = 'left'
  CTDLGAME.objects.forEach(object => QUADTREE.insert(object))
  CTDLGAME.objects.forEach(object => object.update())
  tick()
}
function tick() {
  if (frame % constants.FRAMERATE === 0) {
    constants.charContext.clearRect(0, 0, constants.WIDTH, constants.HEIGHT)

    // apply gravity
    hodlonaut.vy += constants.GRAVITY
    katoshi.vy += constants.GRAVITY

    CTDLGAME.objects.forEach(object => object.update())

    // window.SHOWQUAD = true
    // blocks = blocks.map(block => moveBlock(block, {x: 0, y: 1}))
    QUADTREE.clear()
    if (window.SHOWQUAD) constants.gameContext.clearRect(0, 0, constants.WIDTH, constants.HEIGHT)
    QUADTREE.insert(hodlonaut)
    QUADTREE.insert(katoshi)
    CTDLGAME.objects.forEach(object => QUADTREE.insert(object))
    if (window.SHOWQUAD) QUADTREE.show(constants.gameContext)
  }

  frame++
  window.requestAnimationFrame(tick)
}