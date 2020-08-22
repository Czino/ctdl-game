import { QuadTree, Boundary } from './quadTree'
import Character from './character'
import Block from './block'
import initEvents from './events'

const checkBlockTime = 1000 * 60 * 2 // minutues
const gameCanvas = document.getElementById('ctdl-game')
gameCanvas.width = 128
gameCanvas.height = 256
const charCanvas = document.getElementById('ctdl-game-chars')
charCanvas.width = 128
charCanvas.height = 256

const gameContext = gameCanvas.getContext('2d')
const charContext = charCanvas.getContext('2d')

window.GROUNDHEIGHT = 6
window.KEYS = []
window.SELECTED = null

let frame = 0
window.QUADTREE = new QuadTree(new Boundary({
  x: 0,
  y: 0,
  w: gameCanvas.width,
  h: gameCanvas.height
}))
let ground = new Block('ground', gameContext, QUADTREE, {
  x: 0,
  y: gameCanvas.height,
  w: gameCanvas.width,
  h: GROUNDHEIGHT,
  isStatic: true,
  isSolid: true
})
let blocks = [
  ground
]
const hodlonaut = new Character(
  'hodlonaut',
  charContext,
  QUADTREE,
  {
    x: 0,
    y: gameCanvas.height - GROUNDHEIGHT
  }
)
const katoshi = new Character(
  'katoshi',
  charContext,
  QUADTREE,
  {
    active: false,
    x: gameCanvas.width / 2,
    y: gameCanvas.height - GROUNDHEIGHT
  }
)

init()

async function init() {
  initEvents()

  for (let i = 0; i < 5; i++) {
    blocks.push(new Block(
      i,
      gameContext,
      QUADTREE,
      {
        x: 21 + i * 6,
        y: gameCanvas.height - GROUNDHEIGHT,
        w: 6,
        h: 6,
        isSolid: true,
        isStatic: true
      }
    ))
  }
  for (let i = 0; i < 4; i++) {
    blocks.push(new Block(
      '1-' + i,
      gameContext,
      QUADTREE,
      {
        x: 24 + i * 6,
        y: gameCanvas.height - GROUNDHEIGHT - 6,
        w: 6,
        h: 6,
        isSolid: true,
        isStatic: true
      }
    ))
  }

  blocks.forEach(block => block.load())
  await ground.load()
  await hodlonaut.load()
  await katoshi.load()

  hodlonaut.select()
  katoshi.direction = 'left'
  QUADTREE.insert(hodlonaut)
  QUADTREE.insert(katoshi)
  blocks.forEach(block => QUADTREE.insert(block))
  blocks.forEach(block => block.update())
  hodlonaut.update()
  katoshi.update()
  tick()
}
function tick() {
  if (frame % 8 === 0) {
    charContext.clearRect(0, 0, charCanvas.width, charCanvas.height)

    // apply gravity
    hodlonaut.vy += 2
    katoshi.vy += 2

    hodlonaut.update()
    katoshi.update()

    // window.SHOWQUAD = true
    // blocks = blocks.map(block => moveBlock(block, {x: 0, y: 1}))
    QUADTREE.clear()
    if (window.SHOWQUAD) gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height)
    QUADTREE.insert(hodlonaut)
    QUADTREE.insert(katoshi)
    blocks.forEach(block => QUADTREE.insert(block))
    if (window.SHOWQUAD) QUADTREE.show(gameContext)
  }

  frame++
  window.requestAnimationFrame(tick)
}