import { QuadTree, Boundary } from './quadTree'
import Character from './character'
import Block from './block'
import { intersects, moveObject } from './geometryUtils'

const checkBlockTime = 1000 * 60 * 2 // minutues
const gameCanvas = document.getElementById('ctdl-game')
gameCanvas.width = 128
gameCanvas.height = 256
const charCanvas = document.getElementById('ctdl-game-chars')
charCanvas.width = 128
charCanvas.height = 256

const gameContext = gameCanvas.getContext('2d')
const charContext = charCanvas.getContext('2d')
const groundHeight = 6
let frame = 0
let keys = []
let quadTree = new QuadTree(new Boundary({
  x: 0,
  y: 0,
  w: gameCanvas.width,
  h: gameCanvas.height
}))
window.tree = quadTree
let ground = new Block('ground', gameContext, quadTree, {
  x: 0,
  y: gameCanvas.height,
  w: gameCanvas.width,
  h: groundHeight,
  isStatic: true,
  isSolid: true
})
let blocks = [
  ground
]
const hodlonaut = new Character('hodlonaut', charContext, quadTree, {x: 0, y: gameCanvas.height - groundHeight})
const katoshi = new Character('katoshi', charContext, quadTree, {x: gameCanvas.width / 2, y: gameCanvas.height - groundHeight})
init()

async function init() {
  for (let i = 0; i < 5; i++) {
    blocks.push(new Block(
      i,
      gameContext,
      quadTree,
      {
        x: 21 + i * 6,
        y: gameCanvas.height - groundHeight,
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
      quadTree,
      {
        x: 24 + i * 6,
        y: gameCanvas.height - groundHeight - 6,
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
  katoshi.direction = 'left'
  quadTree.insert(hodlonaut)
  quadTree.insert(katoshi)
  blocks.forEach(block => quadTree.insert(block))
  blocks.forEach(block => block.draw())
  hodlonaut.draw()
  katoshi.draw()
  tick()
}
function tick() {
  if (frame % 8 === 0) {
    charContext.clearRect(0, 0, charCanvas.width, charCanvas.height)

    if (keys.indexOf('e') !== -1) {
      hodlonaut.jump()
    } else if (keys.indexOf('a') !== -1) {
      hodlonaut.moveLeft()
    } else if (keys.indexOf('d') !== -1) {
      hodlonaut.moveRight()
    } else if (keys.indexOf('w') !== -1) {
      hodlonaut.back()
    } else {
      hodlonaut.idle()
    }
    if (keys.indexOf(' ') !== -1) {
      katoshi.jump()
    } else if (keys.indexOf('ArrowLeft') !== -1) {
      katoshi.moveLeft()
    } else if (keys.indexOf('ArrowRight') !== -1) {
      katoshi.moveRight()
    } else if (keys.indexOf('ArrowUp') !== -1) {
      katoshi.back()
    } else {
      katoshi.idle()
    }

    // apply gravity
    moveObject(hodlonaut, {x: 0, y: 3}, quadTree)
    moveObject(katoshi, {x: 0, y: 3}, quadTree)

    hodlonaut.draw()
    katoshi.draw()

    // window.SHOWQUAD = true
    // blocks = blocks.map(block => moveBlock(block, {x: 0, y: 1}))
    quadTree.clear()
    if (window.SHOWQUAD) gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height)
    quadTree.insert(hodlonaut.getBoundingBox())
    quadTree.insert(katoshi.getBoundingBox())
    blocks.forEach(block => quadTree.insert(block))
    if (window.SHOWQUAD) quadTree.show(gameContext)
  }

  frame++
  window.requestAnimationFrame(tick)
}

window.addEventListener('keydown', e => {
  keys.push(e.key);
})

window.addEventListener('keyup', e => {
  keys = keys.filter(key => {
    return key !== e.key
  })
})