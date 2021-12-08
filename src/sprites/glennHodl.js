const w = 20
const h = 30

export default {
  left: {
    idle: [
      { x: (6 + 0) * w, y: 1 * h, w, h }
    ],
    move: [
      { x: (6 + 2) * w, y: 1 * h, w, h },
      { x: (6 + 3) * w, y: 1 * h, w, h },
      { x: (6 + 4) * w, y: 1 * h, w, h },
      { x: (6 + 5) * w, y: 1 * h, w, h }
    ],
    groove: [
      0, 0, 1, 1
    ].map(frame => ({ x: frame * w, y: 0, w, h })),
    sing: [
      1, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
      1, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
      11, 10, 9, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3, 1
    ].map(frame => ({ x: frame * w, y: 0, w, h }))
  },
  right: {
    idle: [
      { x: 0 * w, y: 1 * h, w, h }
    ],
    move: [
      { x: 2 * w, y: 1 * h, w, h },
      { x: 3 * w, y: 1 * h, w, h },
      { x: 4 * w, y: 1 * h, w, h },
      { x: 5 * w, y: 1 * h, w, h }
    ],
    groove: [
      0, 0, 1, 1
    ].map(frame => ({ x: frame * w, y: 0, w, h })),
    sing: [
      1, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
      1, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
      11, 10, 9, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3, 1
    ].map(frame => ({ x: frame * w, y: 0, w, h }))
  }
}