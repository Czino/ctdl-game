/**
 * @description Method to create simple boundary
 * @param {Object} boundingBox 
 * @returns {Object} boundary
 */
export const makeBoundary = boundingBox => ({
  ...boundingBox,
  isSolid: true,
  getBoundingBox: () => boundingBox,
  update: () => {}
})

export default makeBoundary