// Czino - Lightwanderer and Dark Sparks

import triangle from './triangle'
import square from './square'
import sine from './sine'
import pulse from './pulse'

export default {
  id: 'lightWandererAndDarkSparks',
  length: 174.968,
  loop: true,
  tracks: {
    triangle,
    square,
    pulse2: sine,
    pulse,
    brownNoise: triangle
  },
  init: SNDTRCK => {
    SNDTRCK.devices.pulse2Synth.envelope.release = 6
  },
  deinit: SNDTRCK => {
    SNDTRCK.devices.pulse2Synth.envelope.release = .8
  }
}