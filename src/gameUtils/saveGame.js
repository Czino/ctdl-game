import * as db from '../db'

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
  await db.set('options', window.CTDLGAME.options)
}