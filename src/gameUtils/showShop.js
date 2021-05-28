import constants from '../constants'
import { CTDLGAME } from './CTDLGAME'
import { write } from '../font'
import itemSpriteData from '../sprites/items'
import { addTextToQueue } from '../textUtils'
import Item from '../objects/Item'
import { canDrawOn } from '../performanceUtils'
import { toCurrency } from '../stringUtils'
import getInflation from './getInflation'
import getBTCPrice from './getBTCPrice'
import getFiatPrice from './getFiatPrice'

const priceList = {
  pizza: 6,
  taco: 11,
  steak: 30
}
const stock = ['pizza', 'taco', 'steak']
const threshold = 1500000

/**
 * @description Method to display progress bar
 * @param {Number} progress current progress between 0 - 1
 */
export const showShop = () => {
  if (!canDrawOn('menuContext')) return

  const eventsAdded = CTDLGAME.eventButtons.length > 0
  const shopFor = CTDLGAME.showShop
  const inflation = getInflation()
  const currency = inflation < threshold ? 'USD' : 'BTC'

  constants.menuContext.globalAlpha = 1
  constants.menuContext.fillStyle = '#212121'

  constants.menuContext.fillRect(
    CTDLGAME.viewport.x,
    CTDLGAME.viewport.y,
    constants.WIDTH,
    constants.HEIGHT
  )

  write(
    constants.menuContext,
    inflation < threshold ? 'USD accepted here!' : 'BTC accepted here!',
    {
      x: CTDLGAME.viewport.x,
      y: CTDLGAME.viewport.y + 60,
      w: constants.WIDTH
    },
    'center'
  )

  if (CTDLGAME.menuItem > stock.length) CTDLGAME.menuItem = 0
  if (CTDLGAME.menuItem < 0) CTDLGAME.menuItem = stock.length

  stock.map((item, i) => {
    let spriteData = itemSpriteData[item]
    const price = inflation < threshold ? getFiatPrice(priceList[item]) : getBTCPrice(priceList[item])

    if (i === CTDLGAME.menuItem) {
      write(
        constants.menuContext,
        `>`, {
          x: CTDLGAME.viewport.x + 10,
          y: CTDLGAME.viewport.y + 80 + i * 15,
          w: 10
        },
        'left'
      )
    }
    if (CTDLGAME.inventory.usd - price < 0) constants.menuContext.globalAlpha = .5
    constants.menuContext.drawImage(
      CTDLGAME.assets.items,
      spriteData.x, spriteData.y, spriteData.w, spriteData.h,
      CTDLGAME.viewport.x + 30 - Math.round(spriteData.w / 2),
      CTDLGAME.viewport.y + 80 + Math.round(Math.sin(CTDLGAME.frame / 16 + i * 4)) + i * 15,
      spriteData.w, spriteData.h
    )

    write(
      constants.menuContext,
      `- ${toCurrency(price, currency)}`, {
        x: CTDLGAME.viewport.x + 40,
        y: CTDLGAME.viewport.y + 80 + i * 15,
        w: 60
      },
      'left'
    )
    constants.menuContext.globalAlpha = 1

    if (!eventsAdded) {
      CTDLGAME.eventButtons.push({
        action: 'buyItem',
        x: 20,
        y: 80 + i * 15,
        w: CTDLGAME.viewport.w - 40,
        h: 15,
        active: true,
        onclick: () => {
          const inflation = getInflation()
          const price = inflation < threshold ? getFiatPrice(priceList[item]) : getBTCPrice(priceList[item])

          if (inflation < threshold) {
            if (CTDLGAME.inventory.usd - price < 0) {
              return addTextToQueue('Not enough fiat!')
            }
            CTDLGAME.inventory.usd -= price
          } else {
            if (CTDLGAME.inventory.sats - price < 0) {
              return addTextToQueue('Not enough sats!')
            }
            CTDLGAME.inventory.sats -= price
          }
          const itm =  new Item(item, {})
          itm.touch(shopFor)

          addTextToQueue(`Here is your ${item}`)
        }
      })
    }
  })


  if (CTDLGAME.menuItem === stock.length){
    write(
      constants.menuContext,
      '>',
      {
        x: CTDLGAME.viewport.x + 10,
        y: CTDLGAME.viewport.y + constants.HEIGHT - constants.MENU.h - 20,
        w: 10
      },
      'left'
    )
  }
  write(
    constants.menuContext,
    'Exit shop',
    {
      x: CTDLGAME.viewport.x + 20,
      y: CTDLGAME.viewport.y + constants.HEIGHT - constants.MENU.h - 20,
      w: 100
    },
    'left'
  )
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