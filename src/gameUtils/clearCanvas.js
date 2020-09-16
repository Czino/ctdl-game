import constants from '../constants'
import { CTDLGAME } from './CTDLGAME'


/**
 * @description Method to clear canvas for next draw
 */
export const clearCanvas = () => {
  constants.gameContext.clearRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)
  constants.charContext.clearRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)
  constants.menuContext.clearRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)
}