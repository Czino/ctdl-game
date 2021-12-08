const w = 75
const h = 90
const wFin = 87
const hFin = 45

export default {
  right: {
    swim: [
      { x: 0 * wFin, y: 2 * h + 0 * hFin, w: wFin , h: hFin }
    ],
    move: [
      { x: 0 * wFin, y: 2 * h + 0 * hFin, w: wFin , h: hFin },
      { x: 1 * wFin, y: 2 * h + 0 * hFin, w: wFin , h: hFin },
      { x: 2 * wFin, y: 2 * h + 0 * hFin, w: wFin , h: hFin },
      { x: 3 * wFin, y: 2 * h + 0 * hFin, w: wFin , h: hFin },
      { x: 4 * wFin, y: 2 * h + 0 * hFin, w: wFin , h: hFin },
      { x: 0 * wFin, y: 2 * h + 1 * hFin, w: wFin , h: hFin },
      { x: 1 * wFin, y: 2 * h + 1 * hFin, w: wFin , h: hFin },
      { x: 2 * wFin, y: 2 * h + 1 * hFin, w: wFin , h: hFin },
      { x: 3 * wFin, y: 2 * h + 1 * hFin, w: wFin , h: hFin },
      { x: 4 * wFin, y: 2 * h + 1 * hFin, w: wFin , h: hFin },
      { x: 0 * wFin, y: 2 * h + 2 * hFin, w: wFin , h: hFin },
      { x: 1 * wFin, y: 2 * h + 2 * hFin, w: wFin , h: hFin },
      { x: 2 * wFin, y: 2 * h + 2 * hFin, w: wFin , h: hFin },
      { x: 3 * wFin, y: 2 * h + 2 * hFin, w: wFin , h: hFin },
      { x: 4 * wFin, y: 2 * h + 2 * hFin, w: wFin , h: hFin },
      { x: 0 * wFin, y: 2 * h + 3 * hFin, w: wFin , h: hFin },
      { x: 1 * wFin, y: 2 * h + 3 * hFin, w: wFin , h: hFin },
      { x: 2 * wFin, y: 2 * h + 3 * hFin, w: wFin , h: hFin },
      { x: 3 * wFin, y: 2 * h + 3 * hFin, w: wFin , h: hFin },
      { x: 4 * wFin, y: 2 * h + 3 * hFin, w: wFin , h: hFin },
      { x: 4 * wFin, y: 2 * h + 3 * hFin, w: wFin , h: hFin },
      { x: 4 * wFin, y: 2 * h + 3 * hFin, w: wFin , h: hFin },
      { x: 4 * wFin, y: 2 * h + 3 * hFin, w: wFin , h: hFin }
    ],
    spawn: [
      { x: 0 * w, y: 0 * h, w , h },
      { x: 1 * w, y: 0 * h, w , h },
      { x: 2 * w, y: 0 * h, w , h },
      { x: 3 * w, y: 0 * h, w , h },
      { x: 4 * w, y: 0 * h, w , h }
    ],
    dive: [
      { x: 4 * w, y: 0 * h, w , h },
      { x: 3 * w, y: 0 * h, w , h },
      { x: 2 * w, y: 0 * h, w , h },
      { x: 1 * w, y: 0 * h, w , h },
      { x: 0 * w, y: 0 * h, w , h },
    ],
    idle: [
      { x: 0 * w, y: 1 * h, w , h },
      { x: 0 * w, y: 1 * h, w , h },
      { x: 1 * w, y: 1 * h, w , h },
      { x: 1 * w, y: 1 * h, w , h },
      { x: 1 * w, y: 1 * h, w , h }
    ],
    hurt: [
      { x: 2 * w, y: 1 * h, w , h }
    ],
    rekt: [
      { x: (5 + 1) * w, y: 2 * h, w , h }
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
      { x: 6 * w, y: 3 * h, w: 3 * w , h }
    ],
    attack3Spawn: [
      { x: 0 * w, y: 4 * h, w , h },
      { x: 0 * w, y: 4 * h, w , h },
      { x: 0 * w, y: 4 * h, w , h },
      { x: 0 * w, y: 4 * h, w , h },
      { x: 0 * w, y: 4 * h, w , h },
      { x: 0 * w, y: 4 * h, w , h },
    ],
    attack3Dive: [
      { x: 0 * w, y: 4 * h, w , h },
      { x: 0 * w, y: 4 * h, w , h },
      { x: 0 * w, y: 4 * h, w , h },
      { x: 0 * w, y: 4 * h, w , h },
      { x: 0 * w, y: 4 * h, w , h },
    ],
    attack3Idle: [
      { x: 0 * w, y: 4 * h, w , h },
    ],
    attack3Left: [
      { x: 2 * w, y: 4 * h, w , h },
      { x: 1 * w, y: 4 * h, w , h },
      { x: 1 * w, y: 4 * h, w , h },
      { x: 1 * w, y: 4 * h, w , h },
      { x: 1 * w, y: 4 * h, w , h },
      { x: 2 * w, y: 4 * h, w , h },
      { x: 3 * w, y: 4 * h, w , h }
    ],
    attack3Right: [
      { x: 5 * w, y: 4 * h, w , h },
      { x: 4 * w, y: 4 * h, w , h },
      { x: 4 * w, y: 4 * h, w , h },
      { x: 4 * w, y: 4 * h, w , h },
      { x: 4 * w, y: 4 * h, w , h },
      { x: 5 * w, y: 4 * h, w , h },
      { x: 6 * w, y: 4 * h, w , h }
    ]
  },
  left: {
    swim: [
      { x: 0 * wFin, y: 2 * h + 0 * hFin, w: wFin , h: hFin }
    ],
    move: [
      { x: 0 * wFin, y: 2 * h + 0 * hFin, w: wFin , h: hFin },
      { x: 1 * wFin, y: 2 * h + 0 * hFin, w: wFin , h: hFin },
      { x: 2 * wFin, y: 2 * h + 0 * hFin, w: wFin , h: hFin },
      { x: 3 * wFin, y: 2 * h + 0 * hFin, w: wFin , h: hFin },
      { x: 4 * wFin, y: 2 * h + 0 * hFin, w: wFin , h: hFin },
      { x: 0 * wFin, y: 2 * h + 1 * hFin, w: wFin , h: hFin },
      { x: 1 * wFin, y: 2 * h + 1 * hFin, w: wFin , h: hFin },
      { x: 2 * wFin, y: 2 * h + 1 * hFin, w: wFin , h: hFin },
      { x: 3 * wFin, y: 2 * h + 1 * hFin, w: wFin , h: hFin },
      { x: 4 * wFin, y: 2 * h + 1 * hFin, w: wFin , h: hFin },
      { x: 0 * wFin, y: 2 * h + 2 * hFin, w: wFin , h: hFin },
      { x: 1 * wFin, y: 2 * h + 2 * hFin, w: wFin , h: hFin },
      { x: 2 * wFin, y: 2 * h + 2 * hFin, w: wFin , h: hFin },
      { x: 3 * wFin, y: 2 * h + 2 * hFin, w: wFin , h: hFin },
      { x: 4 * wFin, y: 2 * h + 2 * hFin, w: wFin , h: hFin },
      { x: 0 * wFin, y: 2 * h + 3 * hFin, w: wFin , h: hFin },
      { x: 1 * wFin, y: 2 * h + 3 * hFin, w: wFin , h: hFin },
      { x: 2 * wFin, y: 2 * h + 3 * hFin, w: wFin , h: hFin },
      { x: 3 * wFin, y: 2 * h + 3 * hFin, w: wFin , h: hFin },
      { x: 4 * wFin, y: 2 * h + 3 * hFin, w: wFin , h: hFin },
      { x: 4 * wFin, y: 2 * h + 3 * hFin, w: wFin , h: hFin },
      { x: 4 * wFin, y: 2 * h + 3 * hFin, w: wFin , h: hFin },
      { x: 4 * wFin, y: 2 * h + 3 * hFin, w: wFin , h: hFin }
    ],
    spawn: [
      { x: (5 + 0) * w, y: 0 * h, w , h },
      { x: (5 + 1) * w, y: 0 * h, w , h },
      { x: (5 + 2) * w, y: 0 * h, w , h },
      { x: (5 + 3) * w, y: 0 * h, w , h },
      { x: (5 + 4) * w, y: 0 * h, w , h }
    ],
    dive: [
      { x: (5 + 4) * w, y: 0 * h, w , h },
      { x: (5 + 3) * w, y: 0 * h, w , h },
      { x: (5 + 2) * w, y: 0 * h, w , h },
      { x: (5 + 1) * w, y: 0 * h, w , h },
      { x: (5 + 0) * w, y: 0 * h, w , h }
    ],
    idle: [
      { x: (5 + 0) * w, y: 1 * h, w , h },
      { x: (5 + 0) * w, y: 1 * h, w , h },
      { x: (5 + 1) * w, y: 1 * h, w , h },
      { x: (5 + 1) * w, y: 1 * h, w , h },
      { x: (5 + 1) * w, y: 1 * h, w , h }
    ],
    hurt: [
      { x: (5 + 2) * w, y: 1 * h, w , h },
    ],
    rekt: [
      { x: (5 + 1) * w, y: 2 * h, w , h }
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
      { x: 6 * w, y: 3 * h, w: 3 * w , h }
    ],
    attack3Spawn: [
      { x: 0 * w, y: 4 * h, w , h },
      { x: 0 * w, y: 4 * h, w , h },
      { x: 0 * w, y: 4 * h, w , h },
      { x: 0 * w, y: 4 * h, w , h },
      { x: 0 * w, y: 4 * h, w , h },
      { x: 0 * w, y: 4 * h, w , h },
    ],
    attack3Dive: [
      { x: 0 * w, y: 4 * h, w , h },
      { x: 0 * w, y: 4 * h, w , h },
      { x: 0 * w, y: 4 * h, w , h },
      { x: 0 * w, y: 4 * h, w , h },
      { x: 0 * w, y: 4 * h, w , h },
    ],
    attack3Idle: [
      { x: 0 * w, y: 4 * h, w , h },
    ],
    attack3Left: [
      { x: 2 * w, y: 4 * h, w , h },
      { x: 1 * w, y: 4 * h, w , h },
      { x: 1 * w, y: 4 * h, w , h },
      { x: 1 * w, y: 4 * h, w , h },
      { x: 1 * w, y: 4 * h, w , h },
      { x: 2 * w, y: 4 * h, w , h },
      { x: 3 * w, y: 4 * h, w , h }
    ],
    attack3Right: [
      { x: 5 * w, y: 4 * h, w , h },
      { x: 4 * w, y: 4 * h, w , h },
      { x: 4 * w, y: 4 * h, w , h },
      { x: 4 * w, y: 4 * h, w , h },
      { x: 4 * w, y: 4 * h, w , h },
      { x: 5 * w, y: 4 * h, w , h },
      { x: 6 * w, y: 4 * h, w , h }
    ]
  },
}