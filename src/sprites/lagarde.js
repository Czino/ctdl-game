const w = 20
const h = 30

export default {
  right: {
    idle: [
      { x: 0 * w, y: 0 * h, w, h }
    ],
    exhausted: [
      { x: 1 * w, y: 0 * h, w, h },
      { x: 2 * w, y: 0 * h, w, h }
    ],
    transform: [
      { x: 2 * w, y: 0 * h, w, h },
      { x: 3 * w, y: 0 * h, w, h },
      { x: 4 * w, y: 0 * h, w, h },
      { x: 5 * w, y: 0 * h, w, h },
      { x: 1 * w, y: 1 * h, w, h },
      { x: 2 * w, y: 1 * h, w, h },
      { x: 3 * w, y: 1 * h, w, h },
      { x: 4 * w, y: 1 * h, w, h },
      { x: 5 * w, y: 1 * h, w, h }
    ],
    move: [
      { x: 1 * w, y: 2 * h, w, h },
      { x: 2 * w, y: 2 * h, w, h },
      { x: 3 * w, y: 2 * h, w, h },
      { x: 4 * w, y: 2 * h, w, h },
      { x: 5 * w, y: 2 * h, w, h },
    ],
    attack: [
      { x: 0 * w, y: 3 * h, w, h },
      { x: 0 * w, y: 3 * h, w, h },
      { x: 0 * w, y: 3 * h, w, h },
      { x: 1 * w, y: 3 * h, w, h },
      { x: 1 * w, y: 3 * h, w, h },
      { x: 1 * w, y: 3 * h, w, h }
    ],
    attack2: [
      { x: 0 * w, y: 2 * h, w, h },
      { x: 2 * w, y: 3 * h, w, h },
      { x: 3 * w, y: 3 * h, w, h },
      { x: 4 * w, y: 3 * h, w, h },
      { x: 5 * w, y: 3 * h, w, h },
      { x: 4 * w, y: 3 * h, w, h },
      { x: 3 * w, y: 3 * h, w, h },
      { x: 2 * w, y: 3 * h, w, h },
    ]
  },
  left: {
    idle: [
      { x: (6 + 0) * w, y: 0 * h, w, h }
    ],
    exhausted: [
      { x: (6 + 1) * w, y: 0 * h, w, h },
      { x: (6 + 2) * w, y: 0 * h, w, h }
    ],
    transform: [
      { x: (6 + 2) * w, y: 0 * h, w, h },
      { x: (6 + 3) * w, y: 0 * h, w, h },
      { x: (6 + 4) * w, y: 0 * h, w, h },
      { x: (6 + 5) * w, y: 0 * h, w, h },
      { x: (6 + 1) * w, y: 1 * h, w, h },
      { x: (6 + 2) * w, y: 1 * h, w, h },
      { x: (6 + 3) * w, y: 1 * h, w, h },
      { x: (6 + 4) * w, y: 1 * h, w, h },
      { x: (6 + 5) * w, y: 1 * h, w, h }
    ],
    move: [
      { x: (6 + 1) * w, y: 2 * h, w, h },
      { x: (6 + 2) * w, y: 2 * h, w, h },
      { x: (6 + 3) * w, y: 2 * h, w, h },
      { x: (6 + 4) * w, y: 2 * h, w, h },
      { x: (6 + 5) * w, y: 2 * h, w, h },
    ],
    attack: [
      { x: (6 + 0) * w, y: 3 * h, w, h },
      { x: (6 + 0) * w, y: 3 * h, w, h },
      { x: (6 + 0) * w, y: 3 * h, w, h },
      { x: (6 + 1) * w, y: 3 * h, w, h },
      { x: (6 + 1) * w, y: 3 * h, w, h },
      { x: (6 + 1) * w, y: 3 * h, w, h }
    ],
    attack2: [
      { x: (6 + 0) * w, y: 2 * h, w, h },
      { x: (6 + 2) * w, y: 3 * h, w, h },
      { x: (6 + 3) * w, y: 3 * h, w, h },
      { x: (6 + 4) * w, y: 3 * h, w, h },
      { x: (6 + 5) * w, y: 3 * h, w, h },
      { x: (6 + 4) * w, y: 3 * h, w, h },
      { x: (6 + 3) * w, y: 3 * h, w, h },
      { x: (6 + 2) * w, y: 3 * h, w, h },
    ]
  }
}