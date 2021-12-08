import { CTDLGAME } from './CTDLGAME'

/**
 * @description Method to clean up stage from "expired objects"
 * @returns {void}
 */
export const cleanUpStage = () => {
  CTDLGAME.objects = CTDLGAME.objects
    .filter(obj => {
      // remove objects that have obviously fallen into the abyss except bosses
      return obj.boss || obj.y < CTDLGAME.world.h * 2
    })
    .filter(obj => obj && !obj.remove && obj.y < 2048) // remove objects that are marked for removal

  CTDLGAME.objects = CTDLGAME.objects.filter(obj => {
    if (obj.getClass() === 'Shitcoiner' && obj.status === 'rekt' && !CTDLGAME.isNight) obj.status = 'burning'
    if (obj.removeTimer) obj.removeTimer--
    if (obj.removeTimer === 0) return false


    if (obj.getClass() === 'Shitcoiner' && !CTDLGAME.isNight && obj.status === 'burning' && Math.random() < .25) {
      return false
    }

    if (obj.status !== 'rekt' && obj.status !== 'burning') return true

    return true
  })
}