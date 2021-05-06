const w = 19
const h = 13

export default {
  left: {
    idle: [
      { x: 0 * w, y: 0 * h, w, h }
    ],
    spawn: [
      { x: 0 * w, y: 0 * h, w, h },
      { x: 0 * w, y: 1 * h, w, h },
      { x: 0 * w, y: 2 * h, w, h },
      { x: 0 * w, y: 3 * h, w, h },
      { x: 0 * w, y: 4 * h, w, h },
      { x: 0 * w, y: 5 * h, w, h },
    ],
    stand: [
      { x: 0 * w, y: 5 * h, w, h }
    ],
    duck: [
      { x: 0 * w, y: 5 * h, w, h },
      { x: 0 * w, y: 4 * h, w, h },
      { x: 0 * w, y: 3 * h, w, h },
      { x: 0 * w, y: 2 * h, w, h },
      { x: 0 * w, y: 1 * h, w, h },
      { x: 0 * w, y: 0 * h, w, h }
    ]
  }
}