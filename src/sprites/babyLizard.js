const w = 20
const h = 30

export default {
  right: {
    idle: [
      { x: 0 * w, y: 0 * h, w, h },
    ],
    hurt: [
      { x: 0 * w, y: 1 * h, w, h }
    ],
    egg: [
      { x: 2 * w, y: 0 * h, w, h },
      { x: 2 * w, y: 0 * h, w, h },
      { x: 2 * w, y: 0 * h, w, h },
      { x: 3 * w, y: 0 * h, w, h },
      { x: 2 * w, y: 0 * h, w, h },
      { x: 2 * w, y: 0 * h, w, h },
      { x: 2 * w, y: 0 * h, w, h },
      { x: 2 * w, y: 0 * h, w, h },
      { x: 4 * w, y: 0 * h, w, h }
    ],
    hatch: [
      { x: 2 * w, y: 1 * h, w, h },
      { x: 3 * w, y: 1 * h, w, h },
      { x: 4 * w, y: 1 * h, w, h },
      { x: 5 * w, y: 1 * h, w, h },
      { x: 2 * w, y: 2 * h, w, h },
      { x: 3 * w, y: 2 * h, w, h },
      { x: 4 * w, y: 2 * h, w, h },
    ],
    move: [
      { x: 0 * w, y: 0 * h, w, h },
      { x: 1 * w, y: 0 * h, w, h },
    ],
    attack: [
      { x: 0 * w, y: 1 * h, w, h },
      { x: 0 * w, y: 1 * h, w, h },
      { x: 1 * w, y: 1 * h, w, h },
      { x: 1 * w, y: 1 * h, w, h },
    ],
    rekt: [
      { x: 0 * w, y: 2 * h, w, h },
    ]
  },
  left: {
    idle: [
      { x: (6 + 0) * w, y: 0 * h, w, h },
    ],
    hurt: [
      { x: (6 + 0) * w, y: 1 * h, w, h }
    ],
    egg: [
      { x: (6 + 2) * w, y: 0 * h, w, h },
      { x: (6 + 2) * w, y: 0 * h, w, h },
      { x: (6 + 2) * w, y: 0 * h, w, h },
      { x: (6 + 3) * w, y: 0 * h, w, h },
      { x: (6 + 2) * w, y: 0 * h, w, h },
      { x: (6 + 2) * w, y: 0 * h, w, h },
      { x: (6 + 2) * w, y: 0 * h, w, h },
      { x: (6 + 2) * w, y: 0 * h, w, h },
      { x: (6 + 4) * w, y: 0 * h, w, h }
    ],
    hatch: [
      { x: (6 + 2) * w, y: 1 * h, w, h },
      { x: (6 + 3) * w, y: 1 * h, w, h },
      { x: (6 + 4) * w, y: 1 * h, w, h },
      { x: (6 + 5) * w, y: 1 * h, w, h },
      { x: (6 + 2) * w, y: 2 * h, w, h },
      { x: (6 + 3) * w, y: 2 * h, w, h },
      { x: (6 + 4) * w, y: 2 * h, w, h },
    ],
    move: [
      { x: (6 + 0) * w, y: 0 * h, w, h },
      { x: (6 + 1) * w, y: 0 * h, w, h },
    ],
    attack: [
      { x: (6 + 0) * w, y: 1 * h, w, h },
      { x: (6 + 0) * w, y: 1 * h, w, h },
      { x: (6 + 1) * w, y: 1 * h, w, h },
      { x: (6 + 1) * w, y: 1 * h, w, h },
    ],
    rekt: [
      { x: (6 + 0) * w, y: 2 * h, w, h },
    ]
  }
}