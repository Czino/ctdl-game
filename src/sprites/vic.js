const w = 23
const h = 55

export default {
  right: {
    open: [
      { x: 0 * w, y: 0 * h, w, h },
      { x: 1 * w, y: 0 * h, w, h },
      { x: 2 * w, y: 0 * h, w, h },
      { x: 3 * w, y: 0 * h, w, h },
      { x: 4 * w, y: 0 * h, w, h },
      { x: 5 * w, y: 0 * h, w, h },
    ],
    close: [
      { x: 5 * w, y: 0 * h, w, h },
      { x: 4 * w, y: 0 * h, w, h },
      { x: 3 * w, y: 0 * h, w, h },
      { x: 2 * w, y: 0 * h, w, h },
      { x: 1 * w, y: 0 * h, w, h },
      { x: 0 * w, y: 0 * h, w, h },
    ],
    idle: [
      { x: 5 * w, y: 0 * h, w, h },
    ],
    sleep: [
      { x: 0 * w, y: 0 * h, w, h },
    ],
    happy: [
      { x: 2 * w, y: 1 * h, w, h },
      { x: 1 * w, y: 1 * h, w, h },
      { x: 0 * w, y: 1 * h, w, h },
      { x: 1 * w, y: 1 * h, w, h },
      { x: 2 * w, y: 1 * h, w, h },
      { x: 3 * w, y: 1 * h, w, h },
      { x: 4 * w, y: 1 * h, w, h },
      { x: 3 * w, y: 1 * h, w, h },
      { x: 2 * w, y: 1 * h, w, h },
      { x: 2 * w, y: 1 * h, w, h },
      { x: 2 * w, y: 1 * h, w, h },
      { x: 2 * w, y: 1 * h, w, h },
      { x: 2 * w, y: 1 * h, w, h },
      { x: 2 * w, y: 1 * h, w, h },
      { x: 2 * w, y: 1 * h, w, h },
      { x: 2 * w, y: 1 * h, w, h },
      { x: 2 * w, y: 1 * h, w, h },
      { x: 2 * w, y: 1 * h, w, h },
    ]
  }
}