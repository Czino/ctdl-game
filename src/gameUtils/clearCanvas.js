import constants from '../constants'
import { CTDLGAME } from './CTDLGAME'


/**
 * @description Method to clear canvas for next draw
 */
export const clearCanvas = () => {
  constants.parallaxContext.clearRect(CTDLGAME.viewport.x - CTDLGAME.viewport.x / 2, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT);

  [
    constants.skyContext,
    constants.bgContext,
    constants.gameContext,
    constants.fgContext,
    constants.charContext,
    constants.overlayContext,
    constants.menuContext
  ].map(context => {
    context.clearRect(CTDLGAME.viewport.x, CTDLGAME.viewport.y, constants.WIDTH, constants.HEIGHT)
  })
}