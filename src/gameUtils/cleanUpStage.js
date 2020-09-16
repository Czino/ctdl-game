import { CTDLGAME } from './CTDLGAME'
import constants from '../constants'

export const cleanUpStage = () => {
  CTDLGAME.objects = CTDLGAME.objects.filter(obj => {
    // remove objects that have obviously fallen into the abyss
    return obj.y < constants.WORLD.h * 2
  })
  if (!CTDLGAME.isNight) {
    CTDLGAME.objects = CTDLGAME.objects.filter(obj => {
      if (obj.class !== 'Shitcoiner') return true
      if (obj.status !== 'rekt' && obj.status !== 'burning') return true
      if (obj.status === 'burning' && Math.random() < .25) {
        return false
      }
  
      obj.status = 'burning'
      return true
    })
  }
}