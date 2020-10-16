import constants from '../constants'
import { CTDLGAME } from '../gameUtils'

/**
 * @description Method to show active buttons
 * @returns {void}
 */
export const showButtons = () => {
  constants.menuContext.strokeStyle = '#FFF'
  constants.menuContext.lineWidth = 1
  constants.menuContext.globalAlpha = 1

  constants.menuContext.beginPath()

  constants.BUTTONS.concat(CTDLGAME.eventButtons)
    .filter(btn => btn.active)
    .map(btn => {
      constants.menuContext.rect(
        CTDLGAME.viewport.x + btn.x - .5,
        CTDLGAME.viewport.y + btn.y - .5,
        btn.w,
        btn.h,
      )
    })

  constants.menuContext.stroke()

}

export default showButtons