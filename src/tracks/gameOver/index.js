// Czino - I'm sad

import rhythm from './rhythm'
import melody from './melody'

export default {
  rhythm,
  melody
}

window.SNDTRCK.song = {
  id: 'gameOver',
  length: 20.00,
  loop: false,
  tracks: {
    sine: melody,
    triangle: rhythm,
  }
}