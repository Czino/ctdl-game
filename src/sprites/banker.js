const w = 20
const h = 30

export default {
  right: {
    idle: [
      { x: 0 * w, y: 0 * h, w, h }
    ],
    back: [
      { x: 2 * w, y: 3 * h, w, h }
    ],
    move: [
      { x: 2 * w, y: 0 * h, w, h },
      { x: 3 * w, y: 0 * h, w, h },
      { x: 4 * w, y: 0 * h, w, h },
      { x: 5 * w, y: 0 * h, w, h }
    ],
    hurt: [
      { x: 1 * w, y: 3 * h, w, h }
    ],
    stun: [
      { x: 1 * w, y: 3 * h, w, h }
    ],
    rekt: [
      { x: 3 * w, y: 110, w: 25, h: 10 }
    ],
    attack: [
      { x: 5 * w, y: 3 * h, w, h },
      { x: 5 * w, y: 3 * h, w, h },
      { x: 5 * w, y: 3 * h, w, h },
      { x: 5 * w, y: 4 * h, w, h },
      { x: 0 * w, y: 0 * h, w, h }
    ]
  },
  left: {
    idle: [
      { x: (6 + 0) * w, y: 0 * h, w, h }
    ],
    back: [
      { x: 2 * w, y: 3 * h, w, h }
    ],
    move: [
      { x: (6 + 2) * w, y: 0 * h, w, h },
      { x: (6 + 3) * w, y: 0 * h, w, h },
      { x: (6 + 4) * w, y: 0 * h, w, h },
      { x: (6 + 5) * w, y: 0 * h, w, h }
    ],
    fall: [
      { x: (6 + 1) * w, y: 3 * h, w, h }
    ],
    hurt: [
      { x: (6 + 1) * w, y: 3 * h, w, h }
    ],
    stun: [
      { x: (6 + 1) * w, y: 3 * h, w, h }
    ],
    rekt: [
      { x: 3 * w, y: 110, w: 25, h: 10 }
    ],
    attack: [
      { x: (6 + 5) * w, y: 3 * h, w, h },
      { x: (6 + 5) * w, y: 3 * h, w, h },
      { x: (6 + 5) * w, y: 3 * h, w, h },
      { x: (6 + 5) * w, y: 4 * h, w, h },
      { x: (6 + 0) * w, y: 0 * h, w, h }
    ]
  }
}