// Czino - Another Theme

import triangle from './triangle'
import sine from './sine'
import square from './square'
import pulse from './pulse'

export default {
  id: 'anotherTheme',
  length: 32,
  loop: true,
  tracks: {
    triangle: triangle,
    sine: sine,
    square,
    pulse,
    noise: pulse,
    drum: triangle
  },
  init: SNDTRCK => {
    SNDTRCK.devices.sineSynth.envelope.release = 5.36
  }
}