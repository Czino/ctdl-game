import constants from '../constants'
import { CTDLGAME, skipText } from '../gameUtils'
import { contains } from '../geometryUtils'
import { playSound } from '../sounds'

export const click = e => {
  let canvas = e.target

  if (e.layerX) {
    CTDLGAME.cursor = {
      x: e.layerX / canvas.clientWidth * canvas.getAttribute('width'),
      y: e.layerY / canvas.clientHeight * canvas.getAttribute('height')
    }
  } else if (e.touches?.length > 0) {
    e.stopPropagation()
    window.BUTTONS = []
    Array.from(e.touches).forEach(touch => {
      CTDLGAME.cursor = {
        x: (touch.clientX - e.target.offsetLeft) / canvas.clientWidth * canvas.getAttribute('width'),
        y: (touch.clientY - e.target.offsetTop) / canvas.clientHeight * canvas.getAttribute('height')
      }
      let buttonPressed = constants.BUTTONS.concat(CTDLGAME.eventButtons).find(button =>
        button.active &&
        CTDLGAME.cursor.x > button.x &&
        CTDLGAME.cursor.x < button.x + button.w &&
        CTDLGAME.cursor.y > button.y &&
        CTDLGAME.cursor.y < button.y + button.h
      )

      if (buttonPressed && !buttonPressed.onclick) {
        window.BUTTONS.unshift(buttonPressed)
      }
    })
  }

  if (!/ctdl-game/.test(canvas.id)) return

  let buttonPressed = constants.BUTTONS.concat(CTDLGAME.eventButtons).find(button =>
    button.active &&
    CTDLGAME.cursor.x > button.x &&
    CTDLGAME.cursor.x < button.x + button.w &&
    CTDLGAME.cursor.y > button.y &&
    CTDLGAME.cursor.y < button.y + button.h
  )

  if (buttonPressed?.onclick) {
    buttonPressed.onclick()
  } else if (!CTDLGAME.touchScreen && buttonPressed) {
    window.BUTTONS.unshift(buttonPressed)
  }

  if (CTDLGAME.cursor.y > 215 && CTDLGAME.cursor.y < 232) skipText()

  let click = {
    x: CTDLGAME.cursor.x + CTDLGAME.viewport.x,
    y: CTDLGAME.cursor.y + CTDLGAME.viewport.y,
    w: 1, h: 1
  }

  if (!CTDLGAME.quadTree) return

  let object = CTDLGAME.quadTree.query(click).find(obj => contains(obj.getBoundingBox(), click))

  if (!object && CTDLGAME.ghostBlock && CTDLGAME.ghostBlock.status !== 'bad') {
    // TODO refactor into placeBlock method
    playSound('block')
    CTDLGAME.ghostBlock.context = constants.gameContext
    CTDLGAME.ghostBlock.opacity = 1
    CTDLGAME.ghostBlock.isSolid = true
    CTDLGAME.inventory.blocks.shift()
    CTDLGAME.objects.push(CTDLGAME.ghostBlock)
    if (window.SELECTEDCHARACTER.action.condition()) window.SELECTEDCHARACTER.action.effect()
    CTDLGAME.ghostBlock = null
  }
  if (window.SELECTED) window.SELECTED.unselect()
  if (!object) return
  if (object.select) object.select(object)
  if (object.getClass() === 'Block') {
    object.toggleSolid()
  }
}
