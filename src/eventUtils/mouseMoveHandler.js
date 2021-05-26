import constants from '../constants'
import { CTDLGAME } from '../gameUtils'
import { intersects } from '../geometryUtils'
import { addClass, removeClass } from '../htmlUtils'
import { buttonClicked } from './buttons'

export const mouseMoveHandler = e => {
  let canvas = e.target

  if (!/ctdl-game/.test(canvas.id)) {
    return
  }

  if (e.layerX) {
    CTDLGAME.cursor = {
      x: e.layerX / canvas.clientWidth * canvas.getAttribute('width'),
      y: e.layerY / canvas.clientHeight * canvas.getAttribute('height')
    }
  }
  let hover = {
    x: CTDLGAME.cursor.x,
    y: CTDLGAME.cursor.y,
    w: 1, h: 1
  }
  let buttonHover = constants.BUTTONS.concat(CTDLGAME.eventButtons)
    .find(button => button.active && intersects(hover, button))

  hover = {
    x: CTDLGAME.cursor.x + CTDLGAME.viewport.x,
    y: CTDLGAME.cursor.y + CTDLGAME.viewport.y,
    w: 1, h: 1
  }
  let blockHover = CTDLGAME.quadTree
    ? CTDLGAME.quadTree.query(hover)
      .filter(obj => obj.getClass() === 'Block')
      .find(block => intersects(hover, block.getBoundingBox()))
    : null

  if (buttonHover || blockHover) {
    addClass(document.body, 'cursor-pointer')
  } else {
    removeClass(document.body, 'cursor-pointer')
  }

  if (blockHover) {
    if (e.buttons > 0 && buttonClicked) {
      blockHover.isSolid = buttonClicked.isSolid
    }
  }
}