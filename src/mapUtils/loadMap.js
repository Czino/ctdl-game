import city from './maps/city'
import forest from './maps/forest'

export const maps = {
  city,
  forest
}

/**
 * @description Method to load map settings
 * @param {String} id world id
 */
export const loadMap = id => maps[id]