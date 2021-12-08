// Czino - Central Bank

import sine from './sine'
import square from './square'
import pulse2 from './pulse2'

export default {
  id: 'centralBank',
  length: 76.7307 + .1923,
  loop: true,
  tracks: {
    sine,
    square: sine,
    pulse: square,
    pulse2,
    triangle: square.map(note => {
      note[2] = note[2].replace('3', '4')
      return note
    })
  },
  // reverbs: ['triangleSynth'],
  lfo: ['pulseSynth'],
  init: SNDTRCK => {
    SNDTRCK.devices.sineSynth.envelope.attack = 0.005
    SNDTRCK.devices.sineSynth.envelope.release = 3
    SNDTRCK.devices.squareSynth.envelope.attack = 0.005
    SNDTRCK.devices.squareSynth.envelope.release = 4

    SNDTRCK.devices.autoFilter = new SNDTRCK.constructor.AutoFilter(.05)
    SNDTRCK.devices.pulseSynth.chain(
      SNDTRCK.devices.autoFilter,
      SNDTRCK.devices.gain
    )
    SNDTRCK.devices.squareSynth.chain(
      SNDTRCK.devices.autoFilter,
      SNDTRCK.devices.gain
    )
  },
  deinit: SNDTRCK => {
    SNDTRCK.devices.autoFilter.stop()
  }
}