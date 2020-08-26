import constants from './constants'
import font from './sprites/font.png'
import hodlonaut from './sprites/hodlonaut.png'
import katoshi from './sprites/katoshi.png'
import genesisBlock from './sprites/genesis-block.png'
import block from './sprites/block.png'
import ground from './sprites/ground.png'
import inventoryBlock from './sprites/inventory-block.png'
import { write } from './font'

export const assets = {
  font,
  hodlonaut,
  katoshi,
  genesisBlock,
  block,
  ground,
  inventoryBlock
}

export const loadAsset = asset => new Promise(resolve => {
  const newImg = new Image;
  newImg.onload = () => {
    resolve(newImg)
  }
  newImg.src = asset
})

const progressBar = {
  x: 19.5,
  y: constants.HEIGHT / 2 - 20.5,
  w: constants.WIDTH - 40,
  h: 20
}

export const showProgressBar = progress => {
  constants.overlayContext.fillStyle = '#FFF'
  constants.overlayContext.strokeStyle = '#FFF'
  constants.overlayContext.lineWidth = 1

  constants.overlayContext.beginPath()
  constants.overlayContext.rect(
    Math.round(progressBar.x + window.CTDLGAME.viewport.x) - .5,
    Math.round(progressBar.y + window.CTDLGAME.viewport.y) - .5,
    progressBar.w,
    progressBar.h
  )
  constants.overlayContext.stroke()

  constants.overlayContext.fillRect(
    Math.round(progressBar.x + window.CTDLGAME.viewport.x),
    Math.round(progressBar.y + window.CTDLGAME.viewport.y),
    progressBar.w * progress - 1,
    progressBar.h - 1
  )

  write(
    constants.overlayContext,
    Math.round(progress * 100) + '%',
    {
      x: Math.round(progressBar.x + window.CTDLGAME.viewport.x),
      y: Math.round(progressBar.y + window.CTDLGAME.viewport.y + progressBar.h) + 1,
      w: progressBar.w
    }
  )
}


const backpack = {
  x: constants.WIDTH / 2 - 10,
  y: constants.HEIGHT - constants.MENU.h + 2,
  w: 22,
  h: 22
}

export const showInventory = inventory => {
  const pos = {
    x: Math.round(backpack.x + window.CTDLGAME.viewport.x),
    y: Math.round(backpack.y + window.CTDLGAME.viewport.y)
  }
  constants.menuContext.fillStyle = '#FFF'
  constants.menuContext.strokeStyle = '#FFF'
  constants.menuContext.lineWidth = 1

  constants.menuContext.beginPath()
  constants.menuContext.rect(
    pos.x - .5,
    pos.y - .5,
    backpack.w,
    backpack.h
  )
  constants.menuContext.stroke()

  constants.menuContext.drawImage(
    window.CTDLGAME.assets.inventoryBlock,
    0, 0, 16, 16,
    pos.x + (backpack.w - 16) / 2, pos.y + (backpack.h - 16) / 2, 16, 16
  )

  write(
    constants.menuContext,
    'ˣ' + inventory.blocks.length,
    { x: pos.x , y: pos.y + backpack.h - 11 , w: backpack.w - 3 },
    'right',
    true
  )
}

const textQueue = []
const timeToShowFinishedText = 256

export const addTextToQueue = text => {
  const lastText = textQueue[textQueue.length - 1]
  const lastFrame = lastText ? lastText.text.length + lastText.frame + timeToShowFinishedText : 0
  textQueue.push({ text, frame: window.CTDLGAME.frame + lastFrame })
}

export const writeMenu = () => {
  if (textQueue.length === 0) return
  if (textQueue[0].text.length + textQueue[0].frame + timeToShowFinishedText - window.CTDLGAME.frame < 0) textQueue.shift()
  if (textQueue.length === 0) return

  write(
    constants.menuContext,
    textQueue[0].text,
    {
      x: window.CTDLGAME.viewport.x + constants.TEXTBOX.x,
      y: window.CTDLGAME.viewport.y + constants.TEXTBOX.y,
      w: constants.TEXTBOX.w
    },
    'left',
    false,
    window.CTDLGAME.frame - textQueue[0].frame
  )
}


export const updateViewport = viewport => {
  const x = Math.round(viewport.x)
  const y = Math.round(viewport.y)
  constants.gameContext.setTransform(1, 0, 0, 1, 0, 0);
  constants.charContext.setTransform(1, 0, 0, 1, 0, 0);
  constants.overlayContext.setTransform(1, 0, 0, 1, 0, 0);
  constants.menuContext.setTransform(1, 0, 0, 1, 0, 0);

  constants.gameContext.translate(-x, -y)
  constants.charContext.translate(-x, -y)
  constants.overlayContext.translate(-x, -y)
  constants.menuContext.translate(-x, -y)
}

const addBlockToInventory = block => {
  if (window.CTDLGAME.blockHeight >= block.height && block.height !== 0) return
  console.log(block)
  window.CTDLGAME.blockHeight = block.height
  window.CTDLGAME.inventory.blocks.push({
    height: block.height,
    id: block.id,
    size: block.size,
    tx_count: block.tx_count
  })
}

export const checkBlocks = startHeight => {
  let url = 'https://blockstream.info/api/blocks/'

  if (typeof startHeight !== 'undefined') url += startHeight
  fetch(url, {
    method: 'GET',
    redirect: 'follow'
  })
    .then(response => response.json())
    .then(blocks => blocks.reverse().forEach(block => addBlockToInventory(block)))
    .catch(error => console.log('error', error))
}