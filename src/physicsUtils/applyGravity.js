import constants from '../constants'
import { CTDLGAME } from '../gameUtils'
import { intersects } from '../geometryUtils'

/**
 * @description Method to apply gravity to game objects
 * @returns {void}
 */
export const applyGravity = () => {
    if (CTDLGAME.lockCharacters) return
    const extendedViewport = {
      x: CTDLGAME.viewportx - 8,
      y: CTDLGAME.viewport.y,
      w: CTDLGAME.viewport.w + 16,
      h: CTDLGAME.viewport.h
    }
    CTDLGAME.objects
      .map(obj => {
        obj.inViewport = intersects(extendedViewport, obj.getBoundingBox())
        return obj
      })
      .filter(obj => obj.applyGravity)
      .filter(obj => obj.inViewport) // only apply gravity to objects in viewport
      .map(obj => obj.vy += constants.GRAVITY)

    // workaround for worst case
    if (CTDLGAME.hodlonaut.y > 1024) CTDLGAME.hodlonaut.y = 800
    if (CTDLGAME.katoshi.y > 1024) CTDLGAME.katoshi.y = 800
}