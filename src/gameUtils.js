import * as db from './db'
import constants from './constants'
import Character from './character'
import Block from './block'
import Shitcoiner from './shitcoiner'

import font from './sprites/font.png'
import icons from './sprites/icons.png'
import hodlonaut from './sprites/hodlonaut.png'
import katoshi from './sprites/katoshi.png'
import shitcoiner from './sprites/shitcoiner.png'
import moon from './sprites/moon.png'
import genesisBlock from './sprites/genesis-block.png'
import block from './sprites/block.png'
import ground from './sprites/ground.png'
import inventoryBlock from './sprites/inventory-block.png'

import { write } from './font'
import { drawIcon } from './icons'

export const assets = {
  font,
  icons,
  hodlonaut,
  katoshi,
  shitcoiner,
  moon,
  genesisBlock,
  block,
  ground,
  inventoryBlock
}

/**
 * @description Method to preload asset
 * @param {String} asset path to asset
 */
export const loadAsset = asset => new Promise(resolve => {
  const newImg = new Image;
  newImg.onload = () => {
    resolve(newImg)
  }
  newImg.src = asset
})

/**
 * @description Method to prepare new game
 */
export const newGame = () => {
  const ground = new Block('ground', constants.gameContext, CTDLGAME.quadTree, {
    x: 0,
    y: constants.WORLD.h - constants.GROUNDHEIGHT - constants.MENU.h,
    w: constants.WORLD.w,
    h: constants.GROUNDHEIGHT,
    isStatic: true,
    isSolid: true
  })

  CTDLGAME.hodlonaut = new Character(
    'hodlonaut',
    constants.charContext,
    CTDLGAME.quadTree,
    {
      x: CTDLGAME.viewport.x + 1,
      y: constants.WORLD.h - constants.GROUNDHEIGHT  - constants.MENU.h - 30
    }
  )
  CTDLGAME.katoshi = new Character(
    'katoshi',
    constants.charContext,
    CTDLGAME.quadTree,
    {
      active: false,
      x: CTDLGAME.viewport.x + constants.WIDTH / 2,
      y: constants.WORLD.h - constants.GROUNDHEIGHT - constants.MENU.h - 30,
      direction: 'left'
    }
  )

  CTDLGAME.objects.push(ground)

  CTDLGAME.hodlonaut.select()

  // addTextToQueue('Hodlonaut and Katoshi find \nthemselves in an unfamiliar region')
}

/**
 * @description Method to load game
 * @returns {Boolean} true if game could be loaded
 */
export const loadGame = async () => {
  let time = await db.get('time')

  if (!time) return false // check if time could be loaded before proceeding

  let viewport = await db.get('viewport')
  let hodlonaut = await db.get('hodlonaut')
  let katoshi = await db.get('katoshi')
  let objects = await db.get('objects')
  let blockHeight = await db.get('blockHeight')
  let inventory = await db.get('inventory')

  if (time) CTDLGAME.frame = time
  if (viewport) {
    CTDLGAME.viewport = viewport
    updateViewport(CTDLGAME.viewport)
  }
  if (objects) {
    CTDLGAME.objects = objects.map(object => {
      if (object.class === 'Block') {
        return new Block(
          object.id,
          constants.gameContext,
          CTDLGAME.quadTree,
          object
        )
      } else if (object.class === 'Shitcoiner') {
        return new Shitcoiner(
          object.id,
          constants.gameContext,
          CTDLGAME.quadTree,
          object
        )
      }
    })
  }
  if (blockHeight) CTDLGAME.blockHeight = blockHeight
  if (inventory) CTDLGAME.inventory = inventory

  CTDLGAME.hodlonaut = new Character(
    'hodlonaut',
    constants.charContext,
    CTDLGAME.quadTree,
    hodlonaut
  )
  CTDLGAME.katoshi = new Character(
    'katoshi',
    constants.charContext,
    CTDLGAME.quadTree,
    katoshi
  )

  if (CTDLGAME.hodlonaut.selected) CTDLGAME.hodlonaut.select()
  if (CTDLGAME.katoshi.selected) CTDLGAME.katoshi.select()

  return true
}

/**
 * @description Method to save game to database
 */
export const saveGame = async () => {
  await db.set('time', window.CTDLGAME.frame)
  await db.set('viewport', window.CTDLGAME.viewport)
  await db.set('hodlonaut', window.CTDLGAME.hodlonaut.toJSON())
  await db.set('katoshi', window.CTDLGAME.katoshi.toJSON())
  await db.set('objects', window.CTDLGAME.objects
    .filter(object => object.class !== 'Character')
    .map(object => {
      return object.toJSON()
    }))
  await db.set('blockHeight', window.CTDLGAME.blockHeight)
  await db.set('inventory', window.CTDLGAME.inventory)
}

const progressBar = {
  x: 20,
  y: constants.HEIGHT / 2 - 20,
  w: constants.WIDTH - 40,
  h: 20
}

/**
 * @description Method to display progress bar
 * @param {Number} progress current progress between 0 - 1
 */
export const showProgressBar = progress => {
  constants.overlayContext.fillStyle = '#212121'

  constants.overlayContext.fillRect(
    window.CTDLGAME.viewport.x,
    window.CTDLGAME.viewport.y,
    constants.WIDTH,
    constants.HEIGHT
  )
  constants.overlayContext.fillStyle = '#FFF'
  constants.overlayContext.strokeStyle = '#FFF'
  constants.overlayContext.lineWidth = 1

  constants.overlayContext.beginPath()
  constants.overlayContext.rect(
    progressBar.x + window.CTDLGAME.viewport.x - .5,
    progressBar.y + window.CTDLGAME.viewport.y - .5,
    progressBar.w,
    progressBar.h
  )
  constants.overlayContext.stroke()

  constants.overlayContext.fillRect(
    progressBar.x + window.CTDLGAME.viewport.x,
    progressBar.y + window.CTDLGAME.viewport.y,
    progressBar.w * progress - 1,
    progressBar.h - 1
  )

  write(
    constants.overlayContext,
    Math.round(progress * 100) + '%',
    {
      x: progressBar.x + window.CTDLGAME.viewport.x,
      y: progressBar.y + window.CTDLGAME.viewport.y + progressBar.h + 1,
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

/**
 * @description Method to show current inventory
 * @param {Object} inventory inventory object
 * @param {Object[]} inventory.blocks found blocks
 */
export const showInventory = inventory => {
  const pos = {
    x: backpack.x + window.CTDLGAME.viewport.x,
    y: backpack.y + window.CTDLGAME.viewport.y
  }

  constants.menuContext.fillStyle = '#212121'
  constants.menuContext.fillRect(
    window.CTDLGAME.viewport.x,
    window.CTDLGAME.viewport.y + constants.HEIGHT - constants.MENU.h,
    constants.MENU.w,
    constants.MENU.h
  )
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

  write(
    constants.menuContext,
    'ś' + inventory.sats + '\n' + '$' + inventory.usd,
    { x: window.CTDLGAME.viewport.x + 2, y: pos.y + 3 , w: 40 },
    'left',
    false
  )
}

export const showHealth = () => {
  const pos = {
    x: constants.WIDTH + window.CTDLGAME.viewport.x - 30,
    y: constants.HEIGHT + window.CTDLGAME.viewport.y - constants.MENU.h + 2
  }
  const chars = [window.CTDLGAME.hodlonaut, window.CTDLGAME.katoshi]

  chars.map((character, i) => {
    drawIcon(
      constants.menuContext,
      character.id,
      {
        x: window.CTDLGAME.viewport.x + constants.WIDTH - 40,
        y: pos.y + 3 + i * 10
      }
    )
  
    for (let h = 0; h < 3; h++) {
      let percent = character.health / character.maxHealth
      let fill = h * (1/3) >= percent
        ? 'empty'
        : h * (1/3) + 1/6 >= percent
        ? 'half'
        : 'full'
  
      drawIcon(
        constants.menuContext,
        'heart-' + fill,
        {
          x: window.CTDLGAME.viewport.x + constants.WIDTH - 30 + h * 9,
          y: pos.y + 3 + i * 10
        }
      )
    }
  })
}


export const showMenu = inventory => {
  showInventory(inventory)
  showHealth()
}

// TODO render mobile controls
const textQueue = []
const timeToShowFinishedText = 256

/**
 * @description Method to add text to queue for showing in the text box
 * @param {String} text text to be queued
 */
export const addTextToQueue = text => {
  const lastText = textQueue[textQueue.length - 1]
  const lastFrame = lastText ? lastText.text.length + lastText.frame + timeToShowFinishedText : 0
  textQueue.push({ text, frame: window.CTDLGAME.frame + lastFrame })
}

/**
 * @description Method to write text from queue to the textbox
 */
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

/**
 * @description Method to show save icon
 */
export const showSaveIcon = () => {
  drawIcon(
    constants.menuContext,
    'save',
    {
      x: CTDLGAME.viewport.x + constants.WIDTH - 10,
      y: CTDLGAME.viewport.y + 3,
      opacity: (256 - CTDLGAME.frame % constants.SAVERATE) / 256
    }
  )
}

/**
 * @description Method to clear canvas for next draw
 */
export const clearCanvas = () => {
  constants.gameContext.clearRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)
  constants.charContext.clearRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)
  constants.menuContext.clearRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)
}

/**
 * @description Method to translate canvas to show current viewport
 * @param {Object} viewport the current viewport
 */
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

/**
 * @description Method to get current time of the day based on the frame in the game
 * @returns {Number} time between 0 - 24 hours
 */
export const getTimeOfDay = () => {
  let time = (window.CTDLGAME.frame % constants.FRAMESINADAY) / constants.FRAMESINADAY * 24 + 6
  if (time > 24) time -= 24
  return time
}

/**
 * @description Method to add a block to the inventory
 * @param {Object} block the block to add
 */
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

/**
 * @description Method to fetch new blocks from the blockchain
 * @param {Number} startHeight height to start from
 */
export const checkBlocks = startHeight => {
  let url = 'https://blockstream.info/api/blocks/'

  if (typeof startHeight !== 'undefined' && startHeight !== null) url += startHeight
  fetch(url, {
    method: 'GET',
    redirect: 'follow'
  })
    .then(response => response.json())
    .then(blocks => blocks.reverse().forEach(block => addBlockToInventory(block)))
    .catch(error => console.log('error', error))
}