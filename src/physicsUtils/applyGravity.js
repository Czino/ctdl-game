import constants from '../constants'
import { CTDLGAME } from '../gameUtils'

/**
 * @description Method to apply gravity to game objects
 * @returns {void}
 */
export const applyGravity = () => {
    CTDLGAME.hodlonaut.vy += constants.GRAVITY
    CTDLGAME.katoshi.vy += constants.GRAVITY
    CTDLGAME.objects
      .filter(obj => obj.enemy || obj.class === 'Item')
      .map(obj => obj.vy += constants.GRAVITY)

    CTDLGAME.objects.forEach(object => object.update())
}