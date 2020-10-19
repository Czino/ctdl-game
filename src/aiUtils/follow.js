/**
 * @description Method to determine action to follow
 * @param {Character|Enemy} char the character or enemy
 * @param {Character|Enemy} other the other character or enemy to follow
 * @returns {String} the action determined
 */
export const follow = (char, other, distance) => {
    if (Math.abs(other.getCenter().x - char.getCenter().x) > char.senseRadius) return 'idle'

    if (char.getBoundingBox().x > other.getBoundingBox().x + other.getBoundingBox().w + distance) {
      return 'moveLeft'
    } else if (other.getBoundingBox().x > char.getBoundingBox().x + char.getBoundingBox().w + distance) {
      return 'moveRight'
    }

  return 'idle'
}

export default follow