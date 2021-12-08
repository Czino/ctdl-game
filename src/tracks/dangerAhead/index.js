// Czino - Capital City

import noise from './noise'
import triangle from './triangle'
import square from './square'
import pulse1 from './pulse1'
// import pulse2 from './pulse2'
import sine from './sine'

export default {
  id: 'capitalCity',
  length: 119.9999 + 1.7143,
  loop: true,
  tracks: {
    noise: noise,
    pulse: pulse1,
    // pulse2,
    triangle,
    drum: triangle.map(note => {
      note[3] = 1
      return note
    }),
    sine,
    square
  },
  reverbs: ['sineSynth', 'squareSynth'],
  lfo: ['squareSynth'],
  init: SNDTRCK => {
    SNDTRCK.devices.pulseSynth.envelope.attack = 1
    SNDTRCK.devices.pulseSynth.envelope.decay = 0
    SNDTRCK.devices.pulseSynth.envelope.release = 6.36
    SNDTRCK.devices.sineSynth.envelope.attack = 1
    SNDTRCK.devices.sineSynth.envelope.decay = 0
    SNDTRCK.devices.sineSynth.envelope.release = 2.36

    SNDTRCK.devices.noiseSynth.noise.type = 'pink'
  }
}