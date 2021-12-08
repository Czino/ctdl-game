import constants from '../constants'
import { CTDLGAME } from '../gameUtils'
import { setButtonClicked } from './buttons'

export const clickEnd = e => {
  let canvas = e.target
  window.BUTTONS = []
  if (e.layerX) {
    CTDLGAME.cursor = {
      x: e.layerX / canvas.clientWidth * canvas.getAttribute('width'),
      y: e.layerY / canvas.clientHeight * canvas.getAttribute('height')
    }
  } else if (e.touches?.length > 0) {
    e.stopPropagation()

    Array.from(e.touches).forEach(touch => {
      CTDLGAME.cursor = {
        x: (touch.clientX - e.target.offsetLeft) / canvas.clientWidth * canvas.getAttribute('width'),
        y: (touch.clientY - e.target.offsetTop) / canvas.clientHeight * canvas.getAttribute('height')
      }
      let buttonPressed = constants.BUTTONS.find(button =>
        button.active &&
        CTDLGAME.cursor.x > button.x &&
        CTDLGAME.cursor.x < button.x + button.w &&
        CTDLGAME.cursor.y > button.y &&
        CTDLGAME.cursor.y < button.y + button.h
      )

      if (buttonPressed) {
        window.BUTTONS.unshift(buttonPressed)
      }
    })
  }

  CTDLGAME.showOverlay = false
  CTDLGAME.zoom = null

  setButtonClicked(null)
}
