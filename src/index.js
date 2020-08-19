import { QuadTree, Boundary } from './quadtree'
import Character from './character'

const checkBlockTime = 1000 * 60 * 2 // minutues
const gameCanvas = document.getElementById('ctdl-game')
gameCanvas.width = 128
gameCanvas.height = 256
const charCanvas = document.getElementById('ctdl-game-chars')
charCanvas.width = 128
charCanvas.height = 256

const gameContext = gameCanvas.getContext('2d')
const charContext = charCanvas.getContext('2d')
const groundHeight = 5
let frame = 0
let keys = []
let quadTree = new QuadTree(new Boundary({
  x: 0,
  y: 0,
  w: gameCanvas.width,
  h: gameCanvas.height,
}))
let ground = {
  id: 'ground',
  x: 0,
  y: Math.round(gameCanvas.height - groundHeight) + .5,
  w: gameCanvas.width,
  h: groundHeight,
  isStatic: true,
  fillStyle: '#FFF',
  strokeStyle: 'transparent'
}
let blocks = [
  ground
]
const hodlonaut = new Character('hodlonaut', charContext, {x: 0, y: gameCanvas.height - groundHeight})
const katoshi = new Character('katoshi', charContext, {x: gameCanvas.width / 2, y: gameCanvas.height - groundHeight})
init()

async function init() {
  for (let i = 0; i < 0; i++) {
    blocks.push({
        id: i,
        x: Math.floor(Math.random() * gameCanvas.width) + .5,
        y: Math.floor(Math.random() * gameCanvas.height) + .5,
        w: 6,
        h: 6,
        idle: 0,
        fillStyle: '#FFF',
        strokeStyle: '#000'
    })
  }

  await hodlonaut.load()
  await katoshi.load()
  katoshi.direction = 'left'
  blocks.forEach(block => quadTree.insert(block))
  blocks.forEach(renderBlock)

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

    hodlonaut.draw()
    katoshi.draw()
    blocks = blocks.map(block => moveBlock(block, {x: 0, y: 1}))
    quadTree.clear()
    if (window.SHOWQUAD) gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height)
    blocks.forEach(block => quadTree.insert(block))
    if (window.SHOWQUAD) quadTree.show(gameContext)
  }

  frame++
  window.requestAnimationFrame(tick)
}

window.addEventListener('keydown', e => {
  console.log(e.key)
  keys.push(e.key);
})

window.addEventListener('keyup', e => {
  keys = keys.filter(key => {
    return key !== e.key
  })
})

function renderBlock(block) {
  gameContext.fillStyle = block.fillStyle
  gameContext.strokeStyle = block.strokeStyle
  gameContext.lineWidth = 1
  gameContext.fillRect(block.x, block.y, block.w, block.h)
  gameContext.strokeRect(block.x, block.y, block.w, block.h)
}
function moveBlock(block, vector) {
  if (block.isStatic) return block

  let result = quadTree.query(new Boundary(block))
  let wouldCollide = result
    .filter(otherBlock => otherBlock.id !== block.id)
    .some(otherBlock => {
      let ghostBlock = {
        ...block,
        x: block.x + vector.x,
        y: block.y + vector.y,
      }

      return !(ghostBlock.x > otherBlock.x + otherBlock.w ||
        ghostBlock.x + ghostBlock.w < otherBlock.x ||
        ghostBlock.y > otherBlock.y + otherBlock.h ||
        ghostBlock.y + ghostBlock.h < otherBlock.y)
    })

  if (wouldCollide) {
    block.idle++

    if (block.idle > 10) block.isStatic = true
    return block
  }
  block.idle = 0

  gameContext.clearRect(block.x, block.y, block.w, block.h)
  block = {
    ...block,
    x: block.x + vector.x,
    y: block.y + vector.y,
  }
  renderBlock(block)

  return block;
}

// checkBlocks()

// setInterval(checkBlocks, checkBlockTime)

function checkBlocks() {
  fetch('https://blockstream.info/api/blocks/', {
    method: 'GET',
    redirect: 'follow'
  })
    .then(response => response.json())
    .then(blocks => addBlock(blocks.pop()))
    .catch(error => console.log('error', error));
}

function addBlock(block) {
  console.log(block)
}