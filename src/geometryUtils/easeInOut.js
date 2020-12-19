/**
 * @description Ease In Out function
 * @param {Number} x x value
 * @param {Number} a amplifier
 * @returns {Number} y value
 */
export const easeInOut = (x, a) => Math.pow(x, a) / (Math.pow(x, a) + Math.pow(1 - x, a))