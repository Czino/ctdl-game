import constants from '../constants'
import { write } from '../font'

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
    'ˣ' + inventory.blocks.length, {
      x: pos.x,
      y: pos.y + backpack.h - 11,
      w: backpack.w - 3
    },
    'right',
    true
  )

  write(
    constants.menuContext,
    'ś' + inventory.sats + '\n' + '$' + inventory.usd, {
      x: window.CTDLGAME.viewport.x + 2,
      y: pos.y + 1,
      w: 40
    },
    'left',
    false
  )
}