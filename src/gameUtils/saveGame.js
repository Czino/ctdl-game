import * as db from '../db'
import { CTDLGAME } from './CTDLGAME'

/**
 * @description Method to save game to database
 */
export const saveGame = async () => {
  await db.set('time', CTDLGAME.frame)
  await db.set('hodlonaut', CTDLGAME.hodlonaut.toJSON())
  await db.set('katoshi', CTDLGAME.katoshi.toJSON())
  await db.set('worldId', CTDLGAME.world.id)
  await db.set(`objects-${CTDLGAME.world.id}`, CTDLGAME.objects
    .filter(object => object && object.class !== 'Character' && object.toJSON)
    .map(object => {
      return object.toJSON()
    }))
  await db.set('blockHeight', CTDLGAME.blockHeight)
  await db.set('inventory', CTDLGAME.inventory)
  await db.set('options', CTDLGAME.options)
}