// Czino - Citadel Under Attack

import triangle from './triangle'
import sine from './sine'
import pulse1 from './pulse1'
import pulse2 from './pulse2'
import square from './square'
import noise from './noise'

export default {
  id: 'citadelUnderAttack',
  length: 37.333,
  bpm: 127,
  loop: true,
  tracks: {
    noise: noise,
    triangle: triangle,
    square: square,
    pulse: pulse1,
    pulse2: pulse2,
    sine: sine
  },
  reverbs: ['sineSynth'],
  init: SNDTRCK => {
    SNDTRCK.devices.autoFilter = new SNDTRCK.constructor.AutoFilter(.01)
    SNDTRCK.devices.autoFilter2 = new SNDTRCK.constructor.AutoFilter(.015)
    SNDTRCK.devices.noiseSynth.envelope.attack = 0
    SNDTRCK.devices.noiseSynth.envelope.sustain = 1

    SNDTRCK.devices.pulseSynth.envelope.attack = 0
    SNDTRCK.devices.pulseSynth.envelope.sustain = 1
    SNDTRCK.devices.pulseSynth.envelope.release = 0
    SNDTRCK.devices.pulse2Synth.envelope.attack = 0
    SNDTRCK.devices.pulse2Synth.envelope.sustain = 1
    SNDTRCK.devices.pulse2Synth.envelope.release = 0

    SNDTRCK.devices.triangleSynth.envelope.attack = 0
    SNDTRCK.devices.triangleSynth.envelope.sustain = 1
    SNDTRCK.devices.triangleSynth.envelope.release = 0

    SNDTRCK.devices.sineSynth.envelope.attack = .5
    SNDTRCK.devices.sineSynth.envelope.release = .5

    SNDTRCK.devices.pulseSynth.disconnect()
    SNDTRCK.devices.pulseSynth.chain(
      SNDTRCK.devices.autoFilter,
      SNDTRCK.devices.gain
    )
    SNDTRCK.devices.pulse2Synth.disconnect()
    SNDTRCK.devices.pulse2Synth.chain(
      SNDTRCK.devices.autoFilter,
      SNDTRCK.devices.gain
    )
    SNDTRCK.devices.autoFilter.start()

    SNDTRCK.devices.triangleSynth.disconnect()
    SNDTRCK.devices.triangleSynth.chain(
      SNDTRCK.devices.autoFilter2,
      SNDTRCK.devices.gain
    )
    SNDTRCK.devices.squareSynth.disconnect()
    SNDTRCK.devices.squareSynth.chain(
      SNDTRCK.devices.autoFilter2,
      SNDTRCK.devices.gain
    )
    SNDTRCK.devices.autoFilter2.start()
  },
  deinit: SNDTRCK => {
    SNDTRCK.devices.pulseSynth.envelope.attack = 0.005
    SNDTRCK.devices.pulseSynth.envelope.release = 0.8
    SNDTRCK.devices.triangleSynth.envelope.attack = 0.005
    SNDTRCK.devices.triangleSynth.envelope.release = 0.8
    SNDTRCK.devices.sineSynth.envelope.attack = 0.005
    SNDTRCK.devices.sineSynth.envelope.release = 0.8
    SNDTRCK.devices.autoFilter.stop()
    SNDTRCK.devices.autoFilter2.stop()

    SNDTRCK.devices.noiseSynth.envelope.attack = 0.005
    SNDTRCK.devices.noiseSynth.envelope.release = 0.8
    SNDTRCK.devices.noiseSynth.noise.type = 'white'
  }
}