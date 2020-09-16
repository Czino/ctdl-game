import { CTDLGAME } from './CTDLGAME'

export const cleanUpStage = () => {
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