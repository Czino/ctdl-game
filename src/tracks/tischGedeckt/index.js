// Czino - Tisch Gedeckt

import sine from './sine'
import pulse from './pulse'

export default {
  id: 'tischGedeckt',
  length: 27.9699 + 0.78744,
  loop: true,
  tracks: {
    sine: sine,
    triangle: pulse,
  },
  init: SNDTRCK => {
    SNDTRCK.devices.sineSynth.envelope.release = 5.36
    SNDTRCK.devices.triangleSynth.envelope.release = 5.36
  }
}