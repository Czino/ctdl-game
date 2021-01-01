import { CTDLGAME } from '../gameUtils'

export const senseCharacters = enemy => {
  let characters = CTDLGAME.quadTree.query({
      x: enemy.x - enemy.senseRadius,
      y: enemy.y - enemy.senseRadius / 2,
      w: enemy.w + enemy.senseRadius * 2,
      h: enemy.h + enemy.senseRadius
    })
    .filter(obj => obj && /Character|Citizen/.test(obj.class) && obj.status !== 'rekt')
    .filter(character => Math.abs(character.getCenter().x - enemy.getCenter().x) <= enemy.senseRadius)

  return characters
}