import constants from '../constants'
import { QuadTree, Boundary } from '../Quadtree'
import { assets } from './assets'

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
  eventButtons: [],
  blockHeight: -1,
  inventory: {
    usd: 0,
    sats: 0,
    blocks: []
  },
}

export const setWorld = world => {
  CTDLGAME.world = world
  CTDLGAME.quadTree = new QuadTree(new Boundary({
    x: -16,
    y: -16,
    w: world.w + 32,
    h: world.h + 32
  }))
}