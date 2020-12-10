// Czino - Bear

import triangle from './triangle'
import pulse1 from './pulse1'
import sine from './sine'
import noise from './noise'

export default {
  id: 'bear',
  length: 24.8182 + 1.3636,
  tracks: {
    brownNoise: triangle,
    pulse: pulse1,
    triangle: triangle,
    sine: sine,
    noise: noise,
  },
  loop: true,
  init: SNDTRCK => {
    SNDTRCK.devices.autoFilter = new SNDTRCK.constructor.AutoFilter(1 / 1.3636)
    SNDTRCK.devices.sineSynth.envelope.attack = 0.0
    SNDTRCK.devices.sineSynth.envelope.release = 1.36
    SNDTRCK.devices.sineSynth.disconnect()
    SNDTRCK.devices.sineSynth.chain(
      SNDTRCK.devices.autoFilter,
      SNDTRCK.devices.reverb,
      SNDTRCK.devices.gain
    )
    SNDTRCK.devices.autoFilter.start()

    SNDTRCK.devices.noiseSynth.noise.type = 'pink'
  },
  deinit: SNDTRCK => {
    SNDTRCK.devices.sineSynth.envelope.attack = 0.005
    SNDTRCK.devices.sineSynth.envelope.release = 0.8
    SNDTRCK.devices.autoFilter.stop()

    SNDTRCK.devices.noiseSynth.noise.type = 'white'
  }
}