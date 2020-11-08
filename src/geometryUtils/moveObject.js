import constants from '../constants'
import { intersects } from './intersects'

/**
 * @description Method to check if an anchor point is inside heightmap
 * @param {Object} anchor anchor object for testing
 * @param {Object} point Object that has heightMask
 * @returns {Boolean} true if anchor point collides
 */
const collidesWithHeightMap = (anchor, point) => {
  const heightMap = point.getHeightMap()

  for (let i = 3; i > 0; i--) {
    let anchorPoint = {
      ...anchor,
      x: anchor.x + Math.round(anchor.w / i)
    }

    if (intersects(anchorPoint, point.getBoundingBox())) {
      const touchPoint = {
        x: anchorPoint.x - point.x,
        y: anchorPoint.y - point.y
      }

      const isSolid = !heightMap[touchPoint.y] || heightMap[touchPoint.y][touchPoint.x] > 0
      if (isSolid) return true
    }
  }
  return false
}

/**
 * @description Method to move object while respecting collisions
 * @param {Object} object object to be moved
 * @param {Object} vector vector with x, y
 * @param {QuadTree} tree the quad tree
 * @returns {Boolean} if true object has not collided
 */
export const moveObject = (object, vector, tree) => {
  let hasCollided = true

  while (hasCollided && (vector.x !== 0 || vector.y !== 0)) {
    object.x += vector.x
    object.y += vector.y

    hasCollided = tree.query(object.getBoundingBox())
      .filter(point => point.isSolid && point.id !== object.id)
      .some(point => {
        if (intersects(object.getBoundingBox(), point.getBoundingBox())) {
          if (point.getHeightMap) {
            const anchor = object.getAnchor()

            for (let i = 0; i < 3; i++) {
              if (collidesWithHeightMap(anchor, point)) {
                anchor.y--
              } else {
                object.y -= i
                object.vy = 0
                i = 0
                return false
              }
            }

            if (window.DRAWSENSORS) {
              constants.overlayContext.fillStyle = 'red'
              constants.overlayContext.fillRect(anchor.x, anchor.y, anchor.w, 1)
            }
          }
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