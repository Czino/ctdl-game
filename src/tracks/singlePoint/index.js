// Czino - Single Point

import triangle from './triangle'
import square from './square'
import sine from './sine'

export default {
  id: 'singlePoint',
  length: 41.143,
  loop: true,
  tracks: {
    triangle,
    square,
    sine
  },
  init: SNDTRCK => {
    SNDTRCK.devices.sineSynth.envelope.attack = .7
    SNDTRCK.devices.sineSynth.envelope.release = 0
  }
}