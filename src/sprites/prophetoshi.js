const w = 13
const h = 32

export default {
  right: {
    idle: [
      { x: 0 * w, y: 0 * h, w, h },
    ],
    move: [
      { x: 0 * w, y: 0 * h, w, h },
    ]
  },
  left: {
    idle: [
      { x: 1 * w, y: 0 * h, w, h },
    ],
    move: [
      { x: 1 * w, y: 0 * h, w, h },
    ]
  }
}