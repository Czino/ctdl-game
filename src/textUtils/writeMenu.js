import constants from '../constants'
import { write } from '../font'
import { textQueue } from './textQueue'

const timeToShowFinishedText = 256

/**
 * @description Method to write text from queue to the textbox
 */
export const writeMenu = () => {
  if (textQueue.length === 0) return
  let next = textQueue[0]

  // if text is used up, remove it from queue
  if (next.text.length + next.frame + timeToShowFinishedText - window.CTDLGAME.frame < 0) textQueue.shift()
  if (textQueue.length === 0) return

  let text = textQueue[0]
  if (text.callback && text.text.length + text.frame + timeToShowFinishedText - window.CTDLGAME.frame < 8) {
    text.callback()
  }

  if (window.CTDLGAME.lockCharacters) {
    constants.menuContext.fillStyle = '#212121'
    constants.menuContext.fillRect(
      window.CTDLGAME.viewport.x + constants.TEXTBOX.x,
      window.CTDLGAME.viewport.y + constants.TEXTBOX.y,
      constants.TEXTBOX.w,
      constants.MENU.h
    )
  }
  write(
    constants.menuContext,
    text.text, {
      x: window.CTDLGAME.viewport.x + constants.TEXTBOX.x,
      y: window.CTDLGAME.viewport.y + constants.TEXTBOX.y,
      w: constants.TEXTBOX.w
    },
    'left',
    false,
    window.CTDLGAME.frame - text.frame
  )
}