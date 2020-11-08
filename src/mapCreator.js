import { assets } from './gameUtils/assets'
import { loadAsset } from './gameUtils/loadAsset'
import constants from './mapCreator/constants'

let frame = 0
const $menu = document.getElementById('ctdl-game-menu')
const $parallax = document.getElementById('ctdl-game-parallax')
const $bg = document.getElementById('ctdl-game-bg')
const $fg = document.getElementById('ctdl-game-fg')
const $info = document.getElementById('ctdl-game-info')
const $tileSet = document.getElementById('ctdl-game-tileset')
const $layer = document.querySelectorAll('input[name=layer]')
const $map = document.getElementById('ctdl-game-map')
const $getJSON = document.getElementById('ctdl-game-getJSON')
const $loadJSON = document.getElementById('ctdl-game-loadJSON')

let tiles
let layer = 'fg'
let currentTile = {
  x: 0,
  y: 0,
  w: 8,
  h: 8,
}
let cursor
let stage = {
  parallax: [],
  bg: [],
  fg: []
}

const clearCanvas = () => {
  [
    'menuContext'
  ].map(name => {
    const canvas = constants[name.replace('Context', 'Canvas')]
    constants[name].clearRect(0, 0, canvas.width, canvas.height)
  })
}

const loadTileSet = async tileSet => {
  tiles = await loadAsset(assets[tileSet])
  constants.menuCanvas.width = tiles.width
  constants.menuCanvas.height = tiles.height
}

const renderTileSet = tiles => {
  if (!tiles) return
  constants.menuContext.drawImage(
    tiles,
    0, 0, tiles.width, tiles.height
  )

  constants.menuContext.globalAlpha = .1
  constants.menuContext.beginPath()
  for (let x = tiles.width; x > 0; x-=8) {
    constants.menuContext.moveTo(x - .5, 0)
    constants.menuContext.lineTo(x - .5, tiles.height)
  }
  for (let y = tiles.height; y > 0; y-=8) {
    constants.menuContext.moveTo(0, y - .5)
    constants.menuContext.lineTo(tiles.width, y - .5)
  }
  constants.menuContext.stroke()


  if (cursor && cursor.canvas === 'ctdl-game-menu') {
    constants.menuContext.globalAlpha = .3
    constants.menuContext.fillStyle = '#FFF'
    let tile = {
      x: Math.floor(cursor.x / 8) * 8,
      y: Math.floor(cursor.y / 8) * 8
    }
    constants.menuContext.fillRect(tile.x, tile.y, 8, 8)
  }
}


const highlightCurrentTile = () => {
  if (currentTile) {
    constants.menuContext.globalAlpha = .5
    constants.menuContext.fillRect(currentTile.x, currentTile.y, currentTile.w, currentTile.h)
  }
  constants.menuContext.globalAlpha = 1
}

const renderMap = updateTiles => {
  if (updateTiles) {
    [
      'parallaxContext',
      'bgContext',
      'fgContext'
    ].map(name => {
      const canvas = constants[name.replace('Context', 'Canvas')]
      constants[name].clearRect(0, 0, canvas.width, canvas.height)
    })
    Object.keys(stage).map(layer => {
      stage[layer].map((row, y) => row.map((tile, x) => {
        if (!tile || tile === 't_0_0') return
        let tileX = tile.split('_')[1]
        let tileY = tile.split('_')[2]
        let imageData = constants.menuContext.getImageData(tileX * 8, tileY * 8, 8, 8)
        constants[layer + 'Context'].putImageData(
          imageData,
          x * 8, y * 8
        ) 
      }))
    })
  }
  if (cursor) {
    let imageData = constants.menuContext.getImageData(currentTile.x, currentTile.y, 8, 8)
    constants.fgContext.putImageData(
      imageData,
      cursor.x, cursor.y
    )
  }
}
init()

/**
 * @description Method to init the game
 * @returns {void}
 */
async function init() {
  changeMap(JSON.parse($tileSet.value))
  tick()
}

/**
 * @description Method to to execute game logic for each tick
 * It also takes care of rendering a frame at specified framerate
 */
function tick() {
  if (frame % constants.FRAMERATE === 0) {

    clearCanvas()

    renderTileSet(tiles)
    renderMap(frame % constants.FRAMERATE === 0)
    highlightCurrentTile()
    if (frame > constants.FRAMERESET) {
      frame = 0
    }
  }

  frame++
  return window.requestAnimationFrame(tick)
}

function changeMap (map) {
  loadTileSet(map.tileSet)
  ;[
    constants.bgCanvas,
    constants.fgCanvas
  ].map(canvas => {
    canvas.width = map.width
    canvas.height = map.height
  })
  constants.parallaxCanvas.width = map.width * 2
  constants.parallaxCanvas.height = map.height

  stage = {
    parallax: createEmpty(map.width * 2 / 8, map.height / 8),
    bg: createEmpty(map.width / 8, map.height / 8),
    fg: createEmpty(map.width / 8, map.height / 8)
  }
}

function createEmpty(width, height) {
  let empty = []

  for (let y = height; y > 0; y--) {
    let row = []
    empty.push(row)
  }
  return empty
}




$tileSet.addEventListener('change', e => changeMap(JSON.parse(e.target.value)))

$getJSON.addEventListener('click', () => $map.value = JSON.stringify(stage).replace(/"t/g, 't').replace(/(\d)"/g, '$1').replace(/null/g, 't_0_0'))
$loadJSON.addEventListener('click', () => {
  stage = JSON.parse($map.value.replace(/t/g, '"t').replace(/(\d)([\],])/g, '$1"$2'))
})

Array.from($layer).map($l => $l.addEventListener('change', e => {
  layer = e.target.value
}))
window.addEventListener('mousemove', mouseMoveHandler)
$menu.addEventListener('mousedown', menuMouseDownHandler)
$parallax.addEventListener('mousedown', mapMouseDownHandler)
$bg.addEventListener('mousedown', mapMouseDownHandler)
$fg.addEventListener('mousedown', mapMouseDownHandler)
window.addEventListener('keydown', e => {
  if (e.metaKey) return
  let key = e.key.toLowerCase()
  let vx = 0
  let vy = 0

  if (key === 'arrowup' || key === 'w') vy = -8
  if (key === 'arrowdown' || key === 's') vy = 8
  if (key === 'arrowleft' || key === 'a') vx = -8
  if (key === 'arrowright' || key === 'd') vx = 8

  if (vx !== 0 || vy !== 0) e.preventDefault()
  currentTile.x += vx
  currentTile.y += vy
  currentTile.id = 't_' + (currentTile.x / 8) + '_' + (currentTile.y / 8)
})

function mouseMoveHandler (e) {
  let canvas = e.target

  if (!/ctdl-game/.test(canvas.id)) {
    return
  }

  if (e.layerX) {
    cursor = {
      x: e.layerX / canvas.clientWidth * canvas.getAttribute('width'),
      y: e.layerY / canvas.clientHeight * canvas.getAttribute('height'),
      canvas: canvas.id
    }
    cursor.x = Math.floor(cursor.x / 8) * 8
    cursor.y = Math.floor(cursor.y / 8) * 8
  }
  $info.innerText = `${cursor.x / 8}/${cursor.y / 8} // ${cursor.x}/${cursor.y}`
}


function menuMouseDownHandler () {
  currentTile = {
    x: Math.floor(cursor.x / 8) * 8,
    y: Math.floor(cursor.y / 8) * 8,
    w: 8,
    h: 8,
  }
  currentTile.id = 't_' + (currentTile.x / 8) + '_' + (currentTile.y / 8)
}

function mapMouseDownHandler () {
  if (!currentTile) return

  stage[layer][cursor.y / 8][cursor.x / 8] = currentTile.id
}