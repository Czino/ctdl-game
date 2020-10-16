import { CTDLGAME } from '../gameUtils'

export const senseCharacters = enemy => {
  let characters = CTDLGAME.quadTree.query({
      x: enemy.x - enemy.senseRadius,
      y: enemy.y - enemy.senseRadius,
      w: enemy.w + enemy.senseRadius * 2,
      h: enemy.h + enemy.senseRadius * 2
    })
    .filter(obj => obj.class === 'Character' && obj.status !== 'rekt')
    .filter(character => Math.abs(character.getCenter().x - enemy.getCenter().x) <= enemy.senseRadius)

  return characters
}