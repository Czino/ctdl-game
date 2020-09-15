import constants from '../constants'

/**
 * @description Method to clear canvas for next draw
 */
export const clearCanvas = () => {
  constants.gameContext.clearRect(window.CTDLGAME.viewport.x, window.CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)
  constants.charContext.clearRect(window.CTDLGAME.viewport.x, window.CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)
  constants.menuContext.clearRect(window.CTDLGAME.viewport.x, window.CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)
}