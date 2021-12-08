const w = 39
const h = 34

export default {
  right: {
    hang: [
      { x: 0 * w, y: 0 * h, w, h },
      { x: 1 * w, y: 0 * h, w, h },
      { x: 2 * w, y: 0 * h, w, h },
      { x: 3 * w, y: 0 * h, w, h },
      { x: 2 * w, y: 0 * h, w, h },
      { x: 1 * w, y: 0 * h, w, h },
    ],
    idle: [
      { x: 0 * w, y: 1 * h, w, h },
      { x: 0 * w, y: 1 * h, w, h },
      { x: 0 * w, y: 1 * h, w, h },
      { x: 0 * w, y: 1 * h, w, h },
      { x: 0 * w, y: 1 * h, w, h },
      { x: 1 * w, y: 1 * h, w, h },
      { x: 1 * w, y: 1 * h, w, h },
      { x: 1 * w, y: 1 * h, w, h },
    ],
    attack: [
      { x: 0 * w, y: 1 * h, w, h },
      { x: 1 * w, y: 1 * h, w, h }
    ],
    move: [
      { x: 0 * w, y: 2 * h, w, h },
      { x: 1 * w, y: 2 * h, w, h },
      { x: 2 * w, y: 2 * h, w, h },
      { x: 3 * w, y: 2 * h, w, h },
      { x: 0 * w, y: 3 * h, w, h },
      { x: 1 * w, y: 3 * h, w, h },
      { x: 2 * w, y: 3 * h, w, h },
      { x: 3 * w, y: 3 * h, w, h },
    ]
  },
  left: {
    hang: [
      { x: 0 * w, y: 0 * h, w, h },
      { x: 1 * w, y: 0 * h, w, h },
      { x: 2 * w, y: 0 * h, w, h },
      { x: 3 * w, y: 0 * h, w, h },
      { x: 2 * w, y: 0 * h, w, h },
      { x: 1 * w, y: 0 * h, w, h },
    ],
    idle: [
      { x: 156 + 0 * w, y: 1 * h, w, h },
      { x: 156 + 0 * w, y: 1 * h, w, h },
      { x: 156 + 0 * w, y: 1 * h, w, h },
      { x: 156 + 0 * w, y: 1 * h, w, h },
      { x: 156 + 0 * w, y: 1 * h, w, h },
      { x: 156 + 1 * w, y: 1 * h, w, h },
      { x: 156 + 1 * w, y: 1 * h, w, h },
      { x: 156 + 1 * w, y: 1 * h, w, h },
    ],
    attack: [
      { x: 156 + 0 * w, y: 1 * h, w, h },
      { x: 156 + 1 * w, y: 1 * h, w, h }
    ],
    move: [
      { x: 156 + 0 * w, y: 2 * h, w, h },
      { x: 156 + 1 * w, y: 2 * h, w, h },
      { x: 156 + 2 * w, y: 2 * h, w, h },
      { x: 156 + 3 * w, y: 2 * h, w, h },
      { x: 156 + 0 * w, y: 3 * h, w, h },
      { x: 156 + 1 * w, y: 3 * h, w, h },
      { x: 156 + 2 * w, y: 3 * h, w, h },
      { x: 156 + 3 * w, y: 3 * h, w, h },
    ]
  }
}