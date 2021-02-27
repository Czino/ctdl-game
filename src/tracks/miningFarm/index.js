// Czino - Mining Farm

import triangle from './triangle'
import sine from './sine'
import pulse1 from './pulse1'
import noise from './noise'

export default {
  id: 'miningFarm',
  length: 1,
  bpm: 127,
  reverbs: ['sineSynth'],
  loop: true,
  tracks: {
    noise: noise,
    triangle: triangle,
    pulse: pulse1,
    sine: sine
  },
  init: SNDTRCK => {
    SNDTRCK.devices.autoFilter = new SNDTRCK.constructor.AutoFilter(.01)
    SNDTRCK.devices.autoFilter2 = new SNDTRCK.constructor.AutoFilter(.015)
    SNDTRCK.devices.noiseSynth.envelope.attack = 0
    SNDTRCK.devices.noiseSynth.envelope.sustain = 1

    SNDTRCK.devices.pulseSynth.envelope.attack = 0
    SNDTRCK.devices.pulseSynth.envelope.sustain = 1
    SNDTRCK.devices.pulseSynth.envelope.release = 0

    SNDTRCK.devices.triangleSynth.envelope.attack = 0
    SNDTRCK.devices.triangleSynth.envelope.sustain = 1
    SNDTRCK.devices.triangleSynth.envelope.release = 0

    SNDTRCK.devices.sineSynth.envelope.attack = .5
    SNDTRCK.devices.sineSynth.envelope.release = .5

    SNDTRCK.devices.pulseSynth.disconnect()
    SNDTRCK.devices.pulseSynth.chain(SNDTRCK.devices.autoFilter, SNDTRCK.devices.gain)
    SNDTRCK.devices.autoFilter.start()

    SNDTRCK.devices.triangleSynth.disconnect()
    SNDTRCK.devices.triangleSynth.chain(SNDTRCK.devices.autoFilter2, SNDTRCK.devices.gain)
    SNDTRCK.devices.autoFilter2.start()
  },
  deinit: SNDTRCK => {
    SNDTRCK.devices.noiseSynth.envelope.attack = 0.005
    SNDTRCK.devices.noiseSynth.envelope.release = 0
    SNDTRCK.devices.noiseSynth.envelope.sustain = .5

    SNDTRCK.devices.pulseSynth.envelope.attack = 0.005
    SNDTRCK.devices.pulseSynth.envelope.sustain = .3
    SNDTRCK.devices.pulseSynth.envelope.release = 0.8

    SNDTRCK.devices.triangleSynth.envelope.attack = 0.005
    SNDTRCK.devices.triangleSynth.envelope.sustain = .3
    SNDTRCK.devices.triangleSynth.envelope.release = 0.8
    SNDTRCK.devices.sineSynth.envelope.attack = 0.005
    SNDTRCK.devices.sineSynth.envelope.release = 0.8
    SNDTRCK.devices.autoFilter.stop()
    SNDTRCK.devices.autoFilter2.stop()

    SNDTRCK.devices.noiseSynth.noise.type = 'white'
  }
}