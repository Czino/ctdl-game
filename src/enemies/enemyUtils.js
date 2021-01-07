import { CTDLGAME } from '../gameUtils'

export const senseCharacters = enemy => {
  let characters = CTDLGAME.quadTree.query({
      x: enemy.x - enemy.senseRadius,
      y: enemy.y - enemy.senseRadius / 2,
      w: enemy.w + enemy.senseRadius * 2,
      h: enemy.h + enemy.senseRadius
    })
    .filter(obj => obj && /Character|Human/.test(obj.getClass()) && obj.status !== 'rekt')
    .filter(character => Math.abs(character.getCenter().x - enemy.getCenter().x) <= enemy.senseRadius)

  return characters
}

export const sense = (enemy, regex) => {
  let characters = CTDLGAME.quadTree.query({
      x: enemy.x - enemy.senseRadius,
      y: enemy.y - enemy.senseRadius / 2,
      w: enemy.w + enemy.senseRadius * 2,
      h: enemy.h + enemy.senseRadius
    })
    .filter(obj => obj && regex.test(obj.getClass()) && obj.status !== 'rekt')
    .filter(character => Math.abs(character.getCenter().x - enemy.getCenter().x) <= enemy.senseRadius)

  return characters
}