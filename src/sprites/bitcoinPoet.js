const w = 12
const h = 22
const set = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
export default {
  right: {
    idle: set
      .concat(set)
      .concat(set)
      .concat(set)
      .concat(set)
      .map(frame => ({ x: frame * w, y: 0, w, h })),
    talk: [
      { x: 2 * w, y: 0, w, h }
    ]
  }
}