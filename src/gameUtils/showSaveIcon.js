import constants from '../constants'
import { drawIcon } from '../icons'
/**
 * @description Method to show save icon
 * @param {Number} opacity opacity value
 */
export const showSaveIcon = opacity => {
  drawIcon(
    constants.menuContext,
    'save', {
      x: window.CTDLGAME.viewport.x + 3,
      y: window.CTDLGAME.viewport.y + 3,
      opacity
    }
  )
}