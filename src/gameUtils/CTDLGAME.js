import constants from '../constants'
import { QuadTree, Boundary } from '../quadTree'
import { assets} from './assets'

export const CTDLGAME = {
  cursor: {x: 0, y: 0},
  frame: 0,
  assets,
  startScreen: true,
  touchScreen: true,
  options: {
    music: true,
    sound: true
  },
  viewport: constants.START,
  objects: [],
  blockHeight: -1,
  inventory: {
    usd: 0,
    sats: 0,
    blocks: []
  },
  quadTree: new QuadTree(new Boundary({
    x: 0,
    y: 0,
    ...constants.WORLD
  }))
}