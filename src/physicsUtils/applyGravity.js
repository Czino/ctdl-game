import constants from '../constants'
import { CTDLGAME } from '../gameUtils'
import { intersects } from '../geometryUtils'

/**
 * @description Method to apply gravity to game objects
 * @returns {void}
 */
export const applyGravity = () => {
    CTDLGAME.hodlonaut.vy += constants.GRAVITY
    CTDLGAME.katoshi.vy += constants.GRAVITY
    CTDLGAME.objects
      .filter(obj => obj.enemy || obj.class === 'Item')
      .filter(obj => intersects(CTDLGAME.viewport, obj)) // only apply gravity to objects in viewport
      .map(obj => obj.vy += constants.GRAVITY)

    CTDLGAME.objects.forEach(object => object.update())

    // workaround for worst case
    if (CTDLGAME.hodlonaut.y > 1024) CTDLGAME.hodlonaut.y = 800
    if (CTDLGAME.katoshi.y > 1024) CTDLGAME.katoshi.y = 800
}