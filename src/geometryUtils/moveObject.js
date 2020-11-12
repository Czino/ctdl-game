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

      if (window.DRAWSENSORS) {
        constants.menuContext.globalAlpha = 1
        constants.menuContext.fillStyle = `hsl(${Math.floor(Math.random() * 360)}, 100%, 70%)`
        constants.menuContext.fillRect(anchorPoint.x, anchorPoint.y, 1, 1)
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
 * @returns {Boolean} if true object has collided
 */
export const moveObject = (object, vector, tree) => {
  let hasCollided = true
  let originalVector = JSON.parse(JSON.stringify(vector))
  let possibleVectors = []

  // we allow object to go up by 3 pixel in case the obstacle is now steep
  // we are going up
  for (let i = 0; i < 3; i++) {
    hasCollided = true
    object.y -= i

    while (hasCollided && (vector.x !== 0 || vector.y !== 0)) {
      object.x += vector.x
      object.y += vector.y

      hasCollided = tree.query(object.getBoundingBox())
        .filter(point => point.isSolid && point.id !== object.id)
        .filter(point => intersects(object.getBoundingBox(), point.getBoundingBox()))
        .some(point => {
          if (!point.getHeightMap) return true

          // check if heightmap reveils more information
          const anchor = object.getAnchor()

          return collidesWithHeightMap(anchor, point)
        })

      if (hasCollided) {
        // would collide, roll back change
        object.x -= vector.x
        object.y -= vector.y

        // reduce vector to find max distance object can move
        if (vector.x > 0) vector.x--
        if (vector.x < 0) vector.x++
        if (vector.y > 0) vector.y--
        if (vector.y < 0) vector.y++
      }
    }

    // store valid vector for later and reset object and vector
    if (!hasCollided) {
      possibleVectors.push({
        y: i,
        vector: JSON.parse(JSON.stringify(vector))
      })
    }

    object.x -= vector.x
    object.y -= vector.y
    object.y += i
    vector = JSON.parse(JSON.stringify(originalVector))
  }

  possibleVectors = possibleVectors.sort((a, b) => {
    let sumA = Math.abs(a.vector.x) + Math.abs(a.vector.y)
    let sumB = Math.abs(b.vector.x) + Math.abs(b.vector.y)
    return sumA > sumB ? -1 : 1
  })

  let bestVector = possibleVectors[0]

  if (bestVector) {
    object.x += bestVector.vector.x
    object.y += bestVector.vector.y
    object.y -= bestVector.y

    if (bestVector.y > 0) object.vy = 0
  }

  return possibleVectors.length === 0
}