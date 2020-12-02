// Czino - Mining Farm

import triangle from './triangle'
import sine from './sine'
import pulse1 from './pulse1'
import noise from './noise'

export default {
  triangle,
  pulse1,
  sine,
  noise,
}

window.SNDTRCK.song = {
  id: 'miningFarm',
  length: 1,
  bpm: 127,
  reverbs: [window.SNDTRCK.devices.sineSynth],
  loop: true,
  tracks: {
    noise: noise,
    triangle: triangle,
    pulse: pulse1,
    sine: sine
  },
  init: () => {
    window.SNDTRCK.devices.autoFilter = new window.SNDTRCK.constructor.AutoFilter(.01)
    window.SNDTRCK.devices.autoFilter2 = new window.SNDTRCK.constructor.AutoFilter(.015)
    window.SNDTRCK.devices.noiseSynth.envelope.attack = 0
    window.SNDTRCK.devices.noiseSynth.envelope.sustain = 1

    window.SNDTRCK.devices.pulseSynth.envelope.attack = 0
    window.SNDTRCK.devices.pulseSynth.envelope.sustain = 1
    window.SNDTRCK.devices.pulseSynth.envelope.release = 0

    window.SNDTRCK.devices.triangleSynth.envelope.attack = 0
    window.SNDTRCK.devices.triangleSynth.envelope.sustain = 1
    window.SNDTRCK.devices.triangleSynth.envelope.release = 0

    window.SNDTRCK.devices.sineSynth.envelope.attack = .5
    window.SNDTRCK.devices.sineSynth.envelope.release = .5

    window.SNDTRCK.devices.pulseSynth.disconnect()
    window.SNDTRCK.devices.pulseSynth.chain(window.SNDTRCK.devices.autoFilter, window.SNDTRCK.devices.gain)
    window.SNDTRCK.devices.autoFilter.start()

    window.SNDTRCK.devices.triangleSynth.disconnect()
    window.SNDTRCK.devices.triangleSynth.chain(window.SNDTRCK.devices.autoFilter2, window.SNDTRCK.devices.gain)
    window.SNDTRCK.devices.autoFilter2.start()
  },
  deinit: () => {
    window.SNDTRCK.devices.pulseSynth.envelope.attack = 0.005
    window.SNDTRCK.devices.pulseSynth.envelope.release = 0.8
    window.SNDTRCK.devices.triangleSynth.envelope.attack = 0.005
    window.SNDTRCK.devices.triangleSynth.envelope.release = 0.8
    window.SNDTRCK.devices.sineSynth.envelope.attack = 0.005
    window.SNDTRCK.devices.sineSynth.envelope.release = 0.8
    window.SNDTRCK.devices.autoFilter.stop()
    window.SNDTRCK.devices.autoFilter2.stop()

    window.SNDTRCK.devices.noiseSynth.noise.type = 'white'
  }
}