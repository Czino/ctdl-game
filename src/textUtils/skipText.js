import constants from '../constants'
import { textQueue, setTextQueue } from './textQueue'

const timeToShowFinishedText = 256

export const skipText = () => {
  let currentText = textQueue[0]
  if (currentText) {
    if (window.CTDLGAME.frame - currentText.text.length > currentText.frame) {
      let deletedText = textQueue.shift()
      if (deletedText.callback) deletedText.callback()
      if (textQueue[0]) textQueue[0].frame = window.CTDLGAME.frame
    } else {
      currentText.frame = window.CTDLGAME.frame - currentText.text.length
    }
    setTextQueue(textQueue.map((text, i) => {
      if (i === 0) return text
      const lastText = textQueue[i - 1]
      let lastFrame = lastText ? lastText.text.length + lastText.frame + timeToShowFinishedText : window.CTDLGAME.frame
      if (window.CTDLGAME.frame + lastFrame > constants.FRAMERESET) lastFrame = window.CTDLGAME.frame - constants.FRAMERESET + lastFrame
      text.frame = lastFrame
      return text
    }))
  }
}