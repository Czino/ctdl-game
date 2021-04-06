const w = 20
const h = 30

export default {
  right: {
    move: [
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
    ].map(frame => ({ x: frame * w, y: 0, w, h }))
  }
}