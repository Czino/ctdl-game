import constants from '../constants'
import { write } from '../font'
import { CTDLGAME } from '../gameUtils'
import { canDrawOn } from '../performanceUtils'

let oldTime = (new Date()).getTime()

/**
 * @description Method to show frame rate
 * @returns {void}
 */
export const showFrameRate = () => {
  let newTime = (new Date()).getTime()
  if (!canDrawOn('menuContext')) {
    oldTime = newTime
    return
  }

  write(
    constants.menuContext,
    String(Math.round(1000 / (newTime - oldTime))),
    {
      x: CTDLGAME.viewport.x || 0,
      y: CTDLGAME.viewport.y || 0,
      w: 80
    },
    'left'
  )
  oldTime = newTime
}

export default showFrameRate