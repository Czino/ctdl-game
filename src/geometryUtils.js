/**
 * @description Method to check whether an object contains another.
 * This method checks if the center of the object is inside the other.
 * @param {Object} obj1 object that is containing
 * @param {Object} obj2 object that is contained
 */
export const contains = (obj1, obj2) => {
    return (
        obj2.x + obj2.w / 2 >= obj1.x && // 45 >= 10 // true
        obj2.x + obj2.w / 2 <= obj1.x + obj1.w && // 45 <= 20 // false
        obj2.y + obj2.h / 2 >= obj1.y &&
        obj2.y + obj2.h / 2 <= obj1.y + obj1.h
    )
}

/**
 * @description Method to check whether two objects intersect. By checking wether one of the corners is inside the other object
 * @param {Object} obj1 object1
 * @param {Object} obj2 object2
 */
export const intersects = (obj1, obj2) => {
    const l1 = obj1.x, r1 = obj1.x + obj1.w
    const u1 = obj1.y, b1 = obj1.y + obj1.h
    const l2 = obj2.x, r2 = obj2.x + obj2.w
    const u2 = obj2.y, b2 = obj2.y + obj2.h
    return (
        (l1 >= l2 && l1 <= r2 && u1 >= u2 && u1 <= b2) || // upper left corner of obj1 inside obj2
        (l1 >= l2 && l1 <= r2 && b1 >= u2 && b1 <= b2) || // lower left corner of obj1 inside obj2
        (r1 >= l2 && r1 <= r2 && u1 >= u2 && u1 <= b2) || // upper right corner of obj1 inside obj2
        (r1 >= l2 && r1 <= r2 && b1 >= u2 && b1 <= b2) // lower right corner of obj1 inside obj2
    )
}