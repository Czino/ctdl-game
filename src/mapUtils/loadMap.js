import city from './maps/city'
import forest from './maps/forest'

const maps = {
  city,
  forest
}

export const loadMap = id => maps[id]