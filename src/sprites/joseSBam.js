const w = 25
const h = 23
const set = [0, 1, 2, 3, 4, 5, 6]
export default {
  left: {
    idle: set
      .map(frame => ({ x: frame * w, y: 0, w, h }))
  }
}