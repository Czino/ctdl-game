import constants from '../constants'
import { CTDLGAME } from './CTDLGAME'
import { write } from '../font'
import itemSpriteData from '../sprites/items'
import { addTextToQueue } from '../textUtils'
import Item from '../Item'

// TODO prize items (add inflation, lol)
const priceList = {
  pizza: 6,
  taco: 11
}
const stock = ['pizza', 'taco']

/**
 * @description Method to display progress bar
 * @param {Number} progress current progress between 0 - 1
 */
export const showShop = () => {
  const eventsAdded = CTDLGAME.eventButtons.length > 0
  const shopFor = CTDLGAME.showShop
  constants.overlayContext.globalAlpha = 1
  constants.overlayContext.fillStyle = '#212121'

  constants.overlayContext.fillRect(
    CTDLGAME.viewport.x,
    CTDLGAME.viewport.y,
    constants.WIDTH,
    constants.HEIGHT
  )

  write(
    constants.overlayContext,
    'Spaeti',
    {
      x: CTDLGAME.viewport.x + 30,
      y: CTDLGAME.viewport.y + 60,
      w: 60
    },
    'left'
  );

  stock.map((item, i) => {
    let spriteData = itemSpriteData[item]

    if (CTDLGAME.inventory.usd - priceList[item] < 0) constants.overlayContext.globalAlpha = .5
    constants.overlayContext.drawImage(
      CTDLGAME.assets.items,
      spriteData.x, spriteData.y, spriteData.w, spriteData.h,
      CTDLGAME.viewport.x + 30 - Math.round(spriteData.w / 2),
      CTDLGAME.viewport.y + 80 + Math.round(Math.sin(CTDLGAME.frame / 16 + i * 4)) + i * 15,
      spriteData.w, spriteData.h
    )

    write(
      constants.overlayContext,
      `- $${priceList[item]}`, {
        x: CTDLGAME.viewport.x + 40,
        y: CTDLGAME.viewport.y + 80 + i * 15,
        w: 60
      },
      'left'
    )
    constants.overlayContext.globalAlpha = 1

    if (!eventsAdded) {
      CTDLGAME.eventButtons.push({
        action: 'buyItem',
        x: 20,
        y: 80 + i * 15,
        w: CTDLGAME.viewport.w - 40,
        h: 15,
        active: true,
        onclick: () => {
          if (CTDLGAME.inventory.usd - priceList[item] < 0) return addTextToQueue('Not enough fiat!')

          CTDLGAME.inventory.usd -= priceList[item]
          const itm =  new Item(item, {})
          itm.touch(shopFor)

          addTextToQueue(`Here is your ${item}`)
        }
      })
    }
  })


  write(
    constants.overlayContext,
    'Exit shop',
    {
      x: CTDLGAME.viewport.x + 20,
      y: CTDLGAME.viewport.y + constants.HEIGHT - constants.MENU.h - 20,
      w: 100
    },
    'left'
  );
  if (!eventsAdded) {
    CTDLGAME.eventButtons.push({
      action: 'exitShop',
      x: 20,
      y: constants.HEIGHT - constants.MENU.h - 20,
      w: 50,
      h: 15,
      active: true,
      onclick: () => {
        CTDLGAME.eventButtons = []
        CTDLGAME.showShop = null
      }
    })
  }
}