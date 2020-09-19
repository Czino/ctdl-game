import constants from '../constants'
import { CTDLGAME } from '../gameUtils'
import { intersects } from './intersects'

const makeBoundary = boundingBox => ({
  isSolid: true,
  getBoundingBox: () => boundingBox
})

/**
 * @description Method to move object while respecting collisions
 * @param {Object} object object to be moved
 * @param {Object} vector vector with x, y
 * @param {QuadTree} tree the quad tree
 * @returns {Boolean} if true object has not collided
 */
export const moveObject = (object, vector, tree) => {
  let hasCollided = true
  const worldBoundaries = [
    makeBoundary({ x: 0, y: -12, w: CTDLGAME.world.w, h: 12 }),
    makeBoundary({ x: CTDLGAME.world.w, y: 0, w: 12, h: CTDLGAME.world.h }),
    makeBoundary({ x: 0, y: CTDLGAME.world.h - constants.GROUNDHEIGHT - constants.MENU.h, w: CTDLGAME.world.w, h: 12 }),
    makeBoundary({ x: -12, y: 0, w: 12, h: CTDLGAME.world.h })
  ]

  while (hasCollided && (vector.x !== 0 || vector.y !== 0)) {
    object.x += vector.x
    object.y += vector.y

    hasCollided = tree.query(object.getBoundingBox()).concat(worldBoundaries)
        .filter(point => point.isSolid && point.id !== object.id)
      .some(point => {
        if (intersects(object.getBoundingBox(), point.getBoundingBox())) {
          // would collide, roll back change
          object.x -= vector.x
          object.y -= vector.y

          // reduce vector to find max distance object can move
          if (vector.x > 0) vector.x--
          if (vector.x < 0) vector.x++
          if (vector.y > 0) vector.y--
          if (vector.y < 0) vector.y++

          return true
        }
        return false
      })
    if (!hasCollided) return !hasCollided
  }
  return !hasCollided
}