// Czino - A Theme

import triangle from './triangle'
import sine from './sine'
import square from './square'

export default {
  id: 'aTheme',
  length: 40,
  loop: true,
  tracks: {
    triangle: triangle,
    sine: sine,
    square,
    noise: triangle
  },
  init: SNDTRCK => {
    SNDTRCK.devices.sineSynth.envelope.release = 5.36
  },
  deinit: SNDTRCK => {
    SNDTRCK.devices.sineSynth.envelope.release = 0.8
  }
}