import constants from '../constants'
import { CTDLGAME } from './CTDLGAME'
import { drawIcon } from '../icons'

const controls = {
  x: 3,
  y: constants.HEIGHT - 20,
  h: 18
}

export const showControls = () => {
  const pos = {
    x: controls.x + CTDLGAME.viewport.x,
    y: controls.y + CTDLGAME.viewport.y
  }

  constants.menuContext.strokeStyle = '#FFF'
  constants.menuContext.fillStyle = '#FFF'
  constants.menuContext.lineWidth = 1

  constants.menuContext.beginPath()

  constants.BUTTONS
    .filter(button => button.active && button.hasBorder)
    .map(button => {
      constants.menuContext.rect(
        pos.x - .5 + button.x,
        button.y - .5 + CTDLGAME.viewport.y,
        button.w,
        button.h
      )
      if (window.BUTTONS.find(b => b.action === button.action)) {
        constants.menuContext.globalAlpha = .2
        constants.menuContext.fillRect(
          pos.x - .5 + button.x,
          button.y - .5 + CTDLGAME.viewport.y,
          button.w,
          button.h
        )
        constants.menuContext.globalAlpha = 1
      }
    })
  constants.menuContext.stroke()

  let selectedCharacter = window.SELECTEDCHARACTER.id
  drawIcon(constants.menuContext, `left-${selectedCharacter}`, {
    x: pos.x + 5,
    y: pos.y + 1
  })
  drawIcon(constants.menuContext, `right-${selectedCharacter}`, {
    x: pos.x + 5 + 21,
    y: pos.y + 1
  })
  drawIcon(constants.menuContext, `back-${selectedCharacter}`, {
    x: pos.x + 5 + 21 * 2,
    y: pos.y + 1
  })
  drawIcon(constants.menuContext, `jump-${selectedCharacter}`, {
    x: pos.x + 5 + 21 * 4,
    y: pos.y + 1
  })
  drawIcon(constants.menuContext, `attack-${selectedCharacter}`, {
    x: pos.x + 5 + 21 * 5,
    y: pos.y
  })
}