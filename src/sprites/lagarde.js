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
      {
        x: 40,
        y: 0,
        w: 20,
        h: 30
      },
      {
        x: 60,
        y: 0,
        w: 20,
        h: 30
      },
      {
        x: 80,
        y: 0,
        w: 20,
        h: 30
      },
      {
        x: 100,
        y: 0,
        w: 20,
        h: 30
      }
    ],
    hurt: [
      {
        x: 20,
        y: 90,
        w: 20,
        h: 30
      }
    ],
    rekt: [
      {
        x: 60,
        y: 110,
        w: 25,
        h: 10
      }
    ],
    wrapped: [
      {
        x: 80,
        y: 30,
        w: 20,
        h: 30
      }
    ],
    action: [
      {
        x: 0,
        y: 120,
        w: 20,
        h: 30
      },
      {
        x: 20,
        y: 120,
        w: 20,
        h: 30
      },
      {
        x: 40,
        y: 120,
        w: 20,
        h: 30
      },
      {
        x: 60,
        y: 120,
        w: 20,
        h: 30
      },
      {
        x: 80,
        y: 120,
        w: 20,
        h: 30
      }
    ],
    hold: [
      {
        x: 0,
        y: 30,
        w: 20,
        h: 30
      },
      {
        x: 20,
        y: 30,
        w: 20,
        h: 30
      }
    ],
    attack: [
      {
        x: 40,
        y: 30,
        w: 20,
        h: 30
      },
      {
        x: 60,
        y: 30,
        w: 20,
        h: 30
      }
    ]
  },
  left: {
    idle: [
      {
        x: 120 + 0,
        y: 0,
        w: 20,
        h: 30
      }
    ],
    move: [
      {
        x: 120 + 40,
        y: 0,
        w: 20,
        h: 30
      },
      {
        x: 120 + 60,
        y: 0,
        w: 20,
        h: 30
      },
      {
        x: 120 + 80,
        y: 0,
        w: 20,
        h: 30
      },
      {
        x: 120 + 100,
        y: 0,
        w: 20,
        h: 30
      }
    ],
    hurt: [
      {
        x: 120 + 20,
        y: 90,
        w: 20,
        h: 30
      }
    ],
    exhausted: [
      {
        x: 120 + 0,
        y: 60,
        w: 20,
        h: 30
      }
    ],
    rekt: [
      {
        x: 120 + 60,
        y: 110,
        w: 25,
        h: 10
      }
    ],
    action: [
      {
        x: 120 + 0,
        y: 120,
        w: 20,
        h: 30
      },
      {
        x: 120 + 20,
        y: 120,
        w: 20,
        h: 30
      },
      {
        x: 120 + 40,
        y: 120,
        w: 20,
        h: 30
      },
      {
        x: 120 + 60,
        y: 120,
        w: 20,
        h: 30
      },
      {
        x: 120 + 80,
        y: 120,
        w: 20,
        h: 30
      }
    ],
    hold: [
      {
        x: 120 + 0,
        y: 30,
        w: 20,
        h: 30
      },
      {
        x: 120 + 20,
        y: 30,
        w: 20,
        h: 30
      }
    ],
    attack: [
      {
        x: 120 + 40,
        y: 30,
        w: 20,
        h: 30
      },
      {
        x: 120 + 60,
        y: 30,
        w: 20,
        h: 30
      }
    ]
  }
}