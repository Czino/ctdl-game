// Czino - Hydra

import triangle from './triangle'
import square from './square'
import sine from './sine'
import drum from './drum'
import noise from './noise'
import brownNoise from './brownNoise'

export default {
  id: 'hydra',
  length: 110.769,
  loop: true,
  tracks: {
    triangle,
    square,
    sine,
    pulse: triangle.map(note => {
      note[2] = note[2].replace('3', '2').replace('4', '3')
      note[3] = .1
      return note
    }),
    drum,
    noise,
    brownNoise,
  },
  reverbs: ['sineSynth', 'squareSynth'],
  init: SNDTRCK => {
    SNDTRCK.devices.squareSynth.envelope.sustain = 0.2
    SNDTRCK.devices.squareSynth.envelope.release = .8
    SNDTRCK.devices.triangleSynth.envelope.attack = 0.5
    SNDTRCK.devices.triangleSynth.envelope.decay = 2.5
    SNDTRCK.devices.triangleSynth.envelope.sustain = 0.2
    SNDTRCK.devices.sineSynth.envelope.sustain = 0.2
    SNDTRCK.devices.sineSynth.envelope.release = .8
    SNDTRCK.devices.noiseSynth.envelope.release = 0
    SNDTRCK.devices.drumSynth.envelope.attack = 0
    SNDTRCK.devices.drumSynth.envelope.sustain = 1

    SNDTRCK.devices.autoFilter = new SNDTRCK.constructor.AutoFilter(.05)
    SNDTRCK.devices.triangleSynth.chain(
      SNDTRCK.devices.autoFilter,
      SNDTRCK.devices.gain
    )
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