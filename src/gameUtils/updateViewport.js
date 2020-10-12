import constants from '../constants'
import { CTDLGAME } from './CTDLGAME'

/**
 * @description Method to translate canvas to show current viewport based on where the characters are
 * @returns {void}
 */
export const updateViewport = () => {
  if (CTDLGAME.multiplayer) {
    CTDLGAME.viewport.x = Math.round((CTDLGAME.hodlonaut.x + CTDLGAME.katoshi.x) / 2 - constants.WIDTH / 2)
    CTDLGAME.viewport.y = Math.min(CTDLGAME.world.h - constants.HEIGHT, Math.round((CTDLGAME.hodlonaut.y + CTDLGAME.katoshi.y) / 2))
  } else {
    CTDLGAME.viewport.x = Math.round(window.SELECTEDCHARACTER.x + window.SELECTEDCHARACTER.w / 2 - constants.WIDTH / 2)
    CTDLGAME.viewport.y = Math.min(CTDLGAME.world.h - constants.HEIGHT, Math.round(window.SELECTEDCHARACTER.y + window.SELECTEDCHARACTER.h - constants.HEIGHT / 2))
  }

  CTDLGAME.viewport.x = Math.max(0, CTDLGAME.viewport.x)
  CTDLGAME.viewport.x = Math.min(CTDLGAME.world.w - constants.WIDTH, CTDLGAME.viewport.x)

  constants.parallaxContext.setTransform(1, 0, 0, 1, 0, 0);
  constants.parallaxContext.translate(-(CTDLGAME.viewport.x - Math.round(CTDLGAME.viewport.x / 2)), -CTDLGAME.viewport.y);

  [
    constants.skyContext,
    constants.bgContext,
    constants.gameContext,
    constants.fgContext,
    constants.charContext,
    constants.overlayContext,
    constants.menuContext
  ].map(context => {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.translate(-CTDLGAME.viewport.x, -CTDLGAME.viewport.y)
  })
}