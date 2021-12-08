const w = 10
const h = 10

export default {
  queue: [
    { x: 0 * w, y: 0 * h, w, h },
    { x: 0 * w, y: 0 * h, w, h },
    { x: 0 * w, y: 1 * h, w, h },
    { x: 0 * w, y: 1 * h, w, h },
    { x: 0 * w, y: 2 * h, w, h },
    { x: 0 * w, y: 2 * h, w, h },
    { x: 0 * w, y: 1 * h, w, h },
    { x: 0 * w, y: 1 * h, w, h }
  ],
  mined: [
    { x: 1 * w, y: 0 * h, w, h },
  ],
  stale: [
    { x: 1 * w, y: 1 * h, w, h }
  ]
}