import { inside } from './inside'

/**
 * @description Method to check whether two objects intersect.
 * @param {Object} obj1 object1
 * @param {Object} obj2 object2
 */
export const intersects = (obj1, obj2) => {
  return inside(obj1, obj2) || inside(obj2, obj1)
}