import city from './maps/city'
import forest from './maps/forest'
import rabbitHole from './maps/rabbitHole'

export const maps = {
  city,
  forest,
  rabbitHole
}

/**
 * @description Method to load map settings
 * @param {String} id world id
 */
export const loadMap = id => maps[id]