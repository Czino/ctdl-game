import { assets } from './spritePreview/assets'
import { loadAsset } from './gameUtils/loadAsset'
import constants from './spritePreview/constants'
import sprites from './sprites'

let frame = 0
let spriteFrame = 0
const $sprites = document.getElementById('ctdl-game-sprites')
const $direction = document.getElementById('ctdl-game-direction')
const $status = document.getElementById('ctdl-game-status')

if (window.location.hash) {
  $status.value = window.location.hash.replace('#', '')
}

let sprite
let spriteData
let direction = $direction.value
let status = $status.value
const clearCanvas = () => {
  constants.baseContext.clearRect(0, 0, constants.baseCanvas.width, constants.baseCanvas.height)
}

const loadSprite = async id => {
  sprite = await loadAsset(assets[id.replace(/-/g, '')])
  spriteData = sprites[id.replace(/\d|-/g, '')]
}


const renderSprite = () => {
  for (let x = constants.baseCanvas.width + 16; x > -16; x -= 4) {
    for (let y = constants.baseCanvas.height + 16; y > -16; y -= 4) {
      if (x % 8 === 0) {
        constants.baseContext.fillStyle = y % 8 === 0 ? '#040' : '#440'
      } else {
        constants.baseContext.fillStyle = y % 8 === 0 ? '#440' : '#040'
      }
      let offset = Math.round(frame / 8) % 8
      constants.baseContext.fillRect(x + offset, y + offset, 4, 4)
    }
  }

  if (!sprite || !spriteData[direction] || !spriteData[direction][status]) return

  let data = spriteData[direction][status]

  if (spriteFrame >= data.length) {
    spriteFrame = 0
  }
  data = data[spriteFrame]

  constants.baseContext.globalAlpha = data.opacity ?? 1

  constants.baseContext.drawImage(
    sprite,
    data.x, data.y, data.w, data.h,
    0, 0, data.w, data.h
  )
  constants.baseContext.globalAlpha = 1
  spriteFrame++
}

init()

/**
 * @description Method to init the game
 * @returns {void}
 */
async function init() {
  await loadSprite($sprites.value)
  tick()
}

/**
 * @description Method to to execute game logic for each tick
 * It also takes care of rendering a frame at specified framerate
 */
function tick() {
  if (frame % constants.FRAMERATE === 0) {
    clearCanvas()
    renderSprite()
    if (frame > constants.FRAMERESET) {
      frame = 0
    }
  }

  frame++
  return window.requestAnimationFrame(tick)
}

$sprites.addEventListener('change', e => loadSprite(e.target.value))
$direction.addEventListener('change', e => direction = e.target.value)
$status.addEventListener('change', e => {
  status = e.target.value
  window.location.hash = status
})