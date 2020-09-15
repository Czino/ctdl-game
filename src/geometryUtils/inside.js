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
    (r1 >= l2 && r1 <= r2 && b1 >= u2 && b1 <= b2) || // lower right corner of obj1 inside obj2
    (u1 >= u2 && u1 <= b2 && l1 < l2 && r1 > r2) || // obj1 top pierces horizontally through obj2
    (b1 >= u2 && b1 <= b2 && l1 < l2 && r1 > r2) || // obj1 bottom pierces horizontally through obj2
    (r1 >= u2 && r1 <= b2 && u1 < u2 && b1 > b2) || // obj1 left pierces vertically through obj2
    (l1 >= u2 && l1 <= b2 && u1 < u2 && b1 > b2) // obj1 right pierces vertically through obj2
  )
}