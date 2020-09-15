import constants from '../constants'

/**
 * @description Method to apply gravity to game objects
 * @returns {void}
 */
export const applyGravity = () => {
    window.CTDLGAME.hodlonaut.vy += constants.GRAVITY
    window.CTDLGAME.katoshi.vy += constants.GRAVITY
    window.CTDLGAME.objects
      .filter(obj => obj.enemy || obj.class === 'Item')
      .map(obj => obj.vy += constants.GRAVITY)

    window.CTDLGAME.objects.forEach(object => object.update())
}