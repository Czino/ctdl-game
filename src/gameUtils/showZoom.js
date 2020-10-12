import { CTDLGAME } from './CTDLGAME'
import constants from '../constants'

const zoom = {
  r: 10,
  offsetY: 30
}
const zoomCanvasses = [
  constants.bgCanvas,
  constants.gameCanvas,
  constants.charCanvas,
  constants.fgCanvas,
  constants.overlayCanvas
]

/**
 * @description Method to render zoom bubble
 * @param {Object} position zoom position
 * @param {Number} position.x zoom x
 * @param {Number} position.y zoom y
 * @returns {void}
 */
export const showZoom = ({ x, y }) => {
  constants.overlayContext.globalAlpha = 1

  zoomCanvasses.map(canvas => {
    constants.overlayContext.drawImage(
      canvas,
      CTDLGAME.cursor.x - zoom.r, CTDLGAME.cursor.y - zoom.r, zoom.r * 2, zoom.r * 2,
      x - zoom.r, y - zoom.offsetY - zoom.r, zoom.r * 2, zoom.r * 2
    )
  })

  constants.overlayContext.strokeStyle = '#FFFFFF'
  constants.overlayContext.lineWidth = 1
  constants.overlayContext.beginPath()
  constants.overlayContext.arc(x, y - zoom.offsetY, zoom.r - .5, Math.PI, 4 * Math.PI)
  constants.overlayContext.stroke()

  // cutout circle
  constants.overlayContext.globalCompositeOperation = 'destination-out'
  constants.overlayContext.beginPath()
  constants.overlayContext.arc(x, y - zoom.offsetY, zoom.r, Math.PI, 1.5 * Math.PI)
  constants.overlayContext.lineTo(x, y - zoom.offsetY - zoom.r - 5)
  constants.overlayContext.lineTo(x - 5 - zoom.r, y - zoom.offsetY - zoom.r - 5)
  constants.overlayContext.lineTo(x - 5 - zoom.r, y - zoom.offsetY)
  constants.overlayContext.fill()
  constants.overlayContext.beginPath()
  constants.overlayContext.arc(x, y - zoom.offsetY, zoom.r, 1.5 * Math.PI, 2 * Math.PI)
  constants.overlayContext.lineTo(x + zoom.r + 5, y - zoom.offsetY)
  constants.overlayContext.lineTo(x + zoom.r + 5, y - zoom.offsetY - zoom.r - 5)
  constants.overlayContext.lineTo(x, y - zoom.offsetY - zoom.r - 5)
  constants.overlayContext.fill()
  constants.overlayContext.beginPath()
  constants.overlayContext.arc(x, y - zoom.offsetY, zoom.r, 2 * Math.PI, 2.5 * Math.PI)
  constants.overlayContext.lineTo(x, y - zoom.offsetY + zoom.r + 5)
  constants.overlayContext.lineTo(x + zoom.r + 5, y - zoom.offsetY + zoom.r + 5)
  constants.overlayContext.lineTo(x + zoom.r + 5, y - zoom.offsetY)
  constants.overlayContext.fill()
  constants.overlayContext.beginPath()
  constants.overlayContext.arc(x, y - zoom.offsetY, zoom.r, 2.5 * Math.PI, 3 * Math.PI)
  constants.overlayContext.lineTo(x - zoom.r - 5, y - zoom.offsetY)
  constants.overlayContext.lineTo(x - zoom.r - 5, y - zoom.offsetY + zoom.r + 5)
  constants.overlayContext.lineTo(x, y - zoom.offsetY + zoom.r + 5)
  constants.overlayContext.fill()
  constants.overlayContext.globalCompositeOperation = 'source-over'
}