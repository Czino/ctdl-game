import { unique } from '../arrayUtils'
import * as db from '../db'
import { maps } from '../mapUtils'
import { playSound } from '../sounds'
import { CTDLGAME } from './CTDLGAME'

/**
 * @description Method to save game to database
 */
export const saveGame = async () => {
  if (CTDLGAME.gameOver) return
  if (CTDLGAME.startedNewGame) {
    CTDLGAME.startedNewGame = false
    await db.remove('time')
    await db.remove('hodlonaut')
    await db.remove('katoshi')
    await db.remove('worldId')
    for (let map in maps) {
      await db.remove(`objects-${map}`)
    }
    await db.remove('blockHeight')
    await db.remove('inventory')
    await db.remove('options')
  }
  await db.set('time', CTDLGAME.frame)
  await db.set('hodlonaut', CTDLGAME.hodlonaut.toJSON())
  await db.set('katoshi', CTDLGAME.katoshi.toJSON())
  if (CTDLGAME.world) {
    await db.set('worldId', CTDLGAME.world.id)
    await db.set(`worldState-${CTDLGAME.world.id}`, CTDLGAME.world.map.state)
    await db.set(`objects-${CTDLGAME.world.id}`, CTDLGAME.objects
      .filter(obj => obj && obj.getClass() !== 'Character' && obj.toJSON)
      .filter(unique('id'))
      .filter(obj => obj.id !== 'bitcoinLabrador' || !obj.follow)
      .map(obj => {
        return obj.toJSON()
      }))
  }
  await db.set('blockHeight', CTDLGAME.blockHeight)
  await db.set('inventory', CTDLGAME.inventory)
  await db.set('options', CTDLGAME.options)
  playSound('select')
  CTDLGAME.savedAt = CTDLGAME.frame
}