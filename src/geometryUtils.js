/**
 * @description Method to check whether an object contains another.
 * This method checks if the center of the object is inside the other.
 * @param {Object} obj1 object that is containing
 * @param {Object} obj2 object that is contained
 */
export const contains = (obj1, obj2) => {
  return (
    obj2.x + obj2.w / 2 >= obj1.x && // 45 >= 10 // true
    obj2.x + obj2.w / 2 <= obj1.x + obj1.w - 1 && // 45 <= 20 // false
    obj2.y + obj2.h / 2 >= obj1.y &&
    obj2.y + obj2.h / 2 <= obj1.y + obj1.h - 1
  )
}

/**
 * @description Method to check whether an object is at least partially inside another.
 * @param {Object} obj1 object1
 * @param {Object} obj2 object2
 */
export const inside = (obj1, obj2) => {
  const l1 = obj1.x, r1 = obj1.x + obj1.w - 1
  const u1 = obj1.y, b1 = obj1.y + obj1.h - 1
  const l2 = obj2.x, r2 = obj2.x + obj2.w - 1
  const u2 = obj2.y, b2 = obj2.y + obj2.h - 1
  return (
    (l1 >= l2 && l1 <= r2 && u1 >= u2 && u1 <= b2) || // upper left corner of obj1 inside obj2
    (l1 >= l2 && l1 <= r2 && b1 >= u2 && b1 <= b2) || // lower left corner of obj1 inside obj2
    (r1 >= l2 && r1 <= r2 && u1 >= u2 && u1 <= b2) || // upper right corner of obj1 inside obj2
    (r1 >= l2 && r1 <= r2 && b1 >= u2 && b1 <= b2) // lower right corner of obj1 inside obj2
  )
}

/**
 * @description Method to check whether two objects intersect.
 * @param {Object} obj1 object1
 * @param {Object} obj2 object2
 */
export const intersects = (obj1, obj2) => {
  return inside(obj1, obj2) || inside(obj2, obj1)
}

/**
 * @description Method to check whether two objects touch.
 * @param {Object} obj1 object1
 * @param {Object} obj2 object2
 */
export const touches = (obj1, obj2) => {
  const feelingObj = {
    x: obj1.x - 1,
    y: obj1.y - 1,
    w: obj1.w + 2,
    h: obj1.h + 2
  }
  return !intersects(obj1, obj2) && intersects(feelingObj, obj2)
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
    hasCollided = tree.query(object)
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

export const setPixel = (context, x, y) => {
  context.fillRect(x, y, 1, 1)
}

// Refer to: http://rosettacode.org/wiki/Bitmap/Bresenham's_line_algorithm#JavaScript
export const sharpLine = (context, x0, y0, x1, y1) => {
  let dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1
  let dy = Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1
  let err = (dx>dy ? dx : -dy) / 2
  while (true) {
    setPixel(context, x0, y0)
    if (x0 === x1 && y0 === y1) break
    const e2 = err
    if (e2 > -dx) {
      err -= dy
      x0 += sx
    }
    if (e2 < dy) {
      err += dx
      y0 += sy
    }
  }
}