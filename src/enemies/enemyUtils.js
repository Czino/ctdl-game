import { CTDLGAME } from '../gameUtils'

// TODO replace use with sense()
export const senseCharacters = enemy => {
  let characters = CTDLGAME.quadTree.query({
      id: enemy.id,
      x: enemy.x - enemy.senseRadius,
      y: enemy.y - enemy.senseRadius / 2,
      w: enemy.w + enemy.senseRadius * 2,
      h: enemy.h + enemy.senseRadius
    })
    .filter(obj => obj && /Character|Human|NakadaiMonarch/.test(obj.getClass()) && obj.status !== 'rekt')
    .filter(character => Math.abs(character.getCenter().x - enemy.getCenter().x) <= enemy.senseRadius)

  return characters
}

export const sense = (enemy, regex) => {
  let characters = CTDLGAME.quadTree.query({
      id: enemy.id,
      x: enemy.x - enemy.senseRadius,
      y: enemy.y - enemy.senseRadius / 2,
      w: enemy.w + enemy.senseRadius * 2,
      h: enemy.h + enemy.senseRadius
    })
    .filter(obj => obj && regex.test(obj.getClass()) && obj.status !== 'rekt')
    .filter(character => Math.abs(character.getCenter().x - enemy.getCenter().x) <= enemy.senseRadius)

  return characters
}