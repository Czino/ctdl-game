// Czino - Ema

import triangle from './triangle'
import sine from './sine'

export default {
  id: 'ema',
  length: 27.068,
  loop: true,
  tracks: {
    triangle,
    noise: triangle,
    sine
  }
}