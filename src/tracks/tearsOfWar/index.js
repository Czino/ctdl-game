// Czino - Tears of War

import triangle from './triangle'
import sine from './sine'

export default {
  id: 'tearsOfWar',
  length: 17.297,
  loop: true,
  tracks: {
    sine: triangle,
    triangle: sine,
  },
  init: SNDTRCK => {
    SNDTRCK.devices.triangleSynth.envelope.release = 16
    SNDTRCK.devices.sineSynth.envelope.release = 16
  },
  deinit: SNDTRCK => {
    SNDTRCK.devices.triangleSynth.envelope.release = 0.07
    SNDTRCK.devices.sineSynth.envelope.release = 0.07
  }
}