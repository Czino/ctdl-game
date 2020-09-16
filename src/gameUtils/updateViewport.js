import constants from '../constants'
import { CTDLGAME } from './CTDLGAME'

/**
 * @description Method to translate canvas to show current viewport based on where the characters are
 */
export const updateViewport = () => {
  if (CTDLGAME.multiplayer) {
    CTDLGAME.viewport = {
      x: Math.round((CTDLGAME.hodlonaut.x + CTDLGAME.katoshi.x) / 2 - constants.WIDTH / 2),
      y: Math.min(
        constants.WORLD.h - constants.HEIGHT,
        Math.round((CTDLGAME.hodlonaut.y + CTDLGAME.katoshi.y) / 2))
    }
  } else {
    CTDLGAME.viewport = {
      x: Math.round(window.SELECTEDCHARACTER.x + window.SELECTEDCHARACTER.w / 2 - constants.WIDTH / 2),
      y: Math.min(
        constants.WORLD.h - constants.HEIGHT,
        Math.round(window.SELECTEDCHARACTER.y + window.SELECTEDCHARACTER.h / 2))
    }
  }

  const x = Math.round(CTDLGAME.viewport.x)
  const y = Math.round(CTDLGAME.viewport.y)

  constants.gameContext.setTransform(1, 0, 0, 1, 0, 0);
  constants.charContext.setTransform(1, 0, 0, 1, 0, 0);
  constants.overlayContext.setTransform(1, 0, 0, 1, 0, 0);
  constants.menuContext.setTransform(1, 0, 0, 1, 0, 0);

  constants.gameContext.translate(-x, -y)
  constants.charContext.translate(-x, -y)
  constants.overlayContext.translate(-x, -y)
  constants.menuContext.translate(-x, -y)
}