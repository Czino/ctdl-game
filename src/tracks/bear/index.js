// Czino - Bear

import triangle from './triangle'
import pulse1 from './pulse1'
import sine from './sine'
import noise from './noise'

export default {
  triangle,
  pulse1,
  sine,
  noise
}

window.SNDTRCK.song = {
    id: 'bear',
    length: 24.8182 + 1.3636,
    tracks: {
      brownNoise: triangle,
      pulse: pulse1,
      triangle: triangle,
      sine: sine,
      noise: noise,
    },
    init: () => {
      window.SNDTRCK.devices.autoFilter = new window.SNDTRCK.constructor.AutoFilter(1 / 1.3636)
      window.SNDTRCK.devices.sineSynth.envelope.attack = 0.0
      window.SNDTRCK.devices.sineSynth.envelope.release = 1.36
      window.SNDTRCK.devices.sineSynth.disconnect()
      window.SNDTRCK.devices.sineSynth.chain(
        window.SNDTRCK.devices.autoFilter,
        window.SNDTRCK.devices.reverb, window.SNDTRCK.devices.gain
      )
      window.SNDTRCK.devices.autoFilter.start()

      window.SNDTRCK.devices.noiseSynth.noise.type = 'pink'
    },
    deinit: () => {
      window.SNDTRCK.devices.sineSynth.envelope.attack = 0.005
      window.SNDTRCK.devices.sineSynth.envelope.release = 0.8
      window.SNDTRCK.devices.autoFilter.stop()

      window.SNDTRCK.devices.noiseSynth.noise.type = 'white'
    },
    loop: true
}