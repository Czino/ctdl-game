const w = 75
const h = 90

export default {
  left: {
    spawn: [
      { x: 0 * w, y: 0 * h, w , h },
      { x: 1 * w, y: 0 * h, w , h },
      { x: 2 * w, y: 0 * h, w , h },
      { x: 3 * w, y: 0 * h, w , h },
      { x: 4 * w, y: 0 * h, w , h }
    ],
    idle: [
      { x: 0 * w, y: 1 * h, w , h },
      { x: 0 * w, y: 1 * h, w , h },
      { x: 1 * w, y: 1 * h, w , h },
      { x: 1 * w, y: 1 * h, w , h },
      { x: 1 * w, y: 1 * h, w , h }
    ],
    attack: [
      { x: 3 * w, y: 1 * h, w , h },
      { x: 2 * w, y: 1 * h, w , h },
      { x: 2 * w, y: 1 * h, w , h },
      { x: 2 * w, y: 1 * h, w , h },
      { x: 2 * w, y: 1 * h, w , h },
      { x: 3 * w, y: 1 * h, w , h },
      { x: 4 * w, y: 1 * h, w , h },
      { x: 4 * w, y: 1 * h, w , h },
      { x: 4 * w, y: 1 * h, w , h },
      { x: 4 * w, y: 1 * h, w , h }
    ],
    attack2: [
      { x: 0 * w, y: 2 * h, w: 3 * w , h }
    ]
  },
  right: {
    spawn: [
      { x: (5 + 0) * w, y: 0 * h, w , h },
      { x: (5 + 1) * w, y: 0 * h, w , h },
      { x: (5 + 2) * w, y: 0 * h, w , h },
      { x: (5 + 3) * w, y: 0 * h, w , h },
      { x: (5 + 4) * w, y: 0 * h, w , h }
    ],
    idle: [
      { x: (5 + 0) * w, y: 1 * h, w , h },
      { x: (5 + 0) * w, y: 1 * h, w , h },
      { x: (5 + 1) * w, y: 1 * h, w , h },
      { x: (5 + 1) * w, y: 1 * h, w , h },
      { x: (5 + 1) * w, y: 1 * h, w , h }
    ],
    attack: [
      { x: (5 + 3) * w, y: 1 * h, w , h },
      { x: (5 + 2) * w, y: 1 * h, w , h },
      { x: (5 + 2) * w, y: 1 * h, w , h },
      { x: (5 + 2) * w, y: 1 * h, w , h },
      { x: (5 + 2) * w, y: 1 * h, w , h },
      { x: (5 + 3) * w, y: 1 * h, w , h },
      { x: (5 + 4) * w, y: 1 * h, w , h },
      { x: (5 + 4) * w, y: 1 * h, w , h },
      { x: (5 + 4) * w, y: 1 * h, w , h },
      { x: (5 + 4) * w, y: 1 * h, w , h }
    ],
    attack2: [
      { x: 0 * w, y: 2 * h, w: 3 * w , h }
    ]
  },
}