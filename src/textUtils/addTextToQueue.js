import constants from '../constants'
import { textQueue } from './textQueue'

const timeToShowFinishedText = 256

/**
 * @description Method to add text to queue for showing in the text box
 * @param {String} text text to be queued
 * @param {Function} callback callback to execute when text is written
 */
export const addTextToQueue = (text, callback) => {
  text += ' ▾'
  const lastText = textQueue[textQueue.length - 1]
  let lastFrame = lastText ? lastText.text.length + lastText.frame + timeToShowFinishedText : window.CTDLGAME.frame
  if (window.CTDLGAME.frame + lastFrame > constants.FRAMERESET) lastFrame = window.CTDLGAME.frame - constants.FRAMERESET + lastFrame
  textQueue.push({
    text,
    frame: lastFrame,
    callback
  })
}