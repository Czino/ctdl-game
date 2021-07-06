import constants from '../constants'
import { CTDLGAME } from '../gameUtils'
import { intersects } from '../geometryUtils'

export const senseCharacters = (enemy, narrow) => sense(enemy, /Character|Human|NakadaiMonarch/, narrow)

export const sense = (enemy, regex, narrow) => {
  const senseBox = {
    id: enemy.id,
    x: enemy.x - enemy.senseRadius,
    y: narrow ? enemy.y - enemy.senseRadius / 8 : enemy.y - enemy.senseRadius / 2,
    w: enemy.w + enemy.senseRadius * 2,
    h: narrow ? enemy.h + enemy.senseRadius / 4: enemy.h + enemy.senseRadius
  }
  let characters = CTDLGAME.quadTree.query(senseBox)
    .filter(obj => obj && regex.test(obj.getClass()) && obj.status !== 'rekt')
    .filter(character => intersects(character.getBoundingBox(), senseBox))

  if (window.DRAWSENSORS) {
    constants.charContext.beginPath()
    constants.charContext.rect(senseBox.x, senseBox.y, senseBox.w, senseBox.h)
    constants.charContext.stroke()
  }
  return characters
}