import city from './maps/city'
import forest from './maps/forest'
import rabbitHole from './maps/rabbitHole'
import endOfTheRabbitHole from './maps/endOfTheRabbitHole'
import dogeCoinMine from './maps/dogeCoinMine'

export const maps = {
  city,
  forest,
  rabbitHole,
  endOfTheRabbitHole,
  dogeCoinMine
}

/**
 * @description Method to load map settings
 * @param {String} id world id
 */
export const loadMap = id => maps[id]