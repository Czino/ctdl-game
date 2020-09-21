export const makeBoundary = boundingBox => ({
  ...boundingBox,
  isSolid: true,
  getBoundingBox: () => boundingBox,
  update: () => {}
})

export default makeBoundary