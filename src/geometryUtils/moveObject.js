import { intersects } from './intersects'

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