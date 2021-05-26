import constants from '../constants'
import { CTDLGAME } from '../gameUtils'

export const startScreenHandler = async (e) => {
  let canvas = e.target
  if (!/ctdl-game/.test(canvas.id)) {
    return
  }

  if (e.layerX) {
    CTDLGAME.cursor = {
      x: e.layerX / canvas.clientWidth * canvas.getAttribute('width'),
      y: e.layerY / canvas.clientHeight * canvas.getAttribute('height')
    }
    let buttonPressed = constants.BUTTONS.concat(CTDLGAME.eventButtons).find(button =>
      button.active &&
      CTDLGAME.cursor.x > button.x &&
      CTDLGAME.cursor.x < button.x + button.w &&
      CTDLGAME.cursor.y > button.y &&
      CTDLGAME.cursor.y < button.y + button.h
    )

    if (buttonPressed?.onclick) buttonPressed.onclick()
  } else if (e.touches?.length > 0) {
    e.stopPropagation()
    CTDLGAME.cursor = {
      x: (e.touches[0].clientX - e.target.offsetLeft) / canvas.clientWidth * canvas.getAttribute('width'),
      y: (e.touches[0].clientY - e.target.offsetTop) / canvas.clientHeight * canvas.getAttribute('height')
    }
    CTDLGAME.touchScreen = true

    constants.BUTTONS
      .filter(button => /moveLeft|moveRight|jump|duck|switch|attack/i.test(button.action))
      .forEach(button => button.active = true)
  }
}

export default startScreenHandler