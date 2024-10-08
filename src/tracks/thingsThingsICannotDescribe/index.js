// Remi - Things Things I cannot Describe (Forz Remix | Czino 8-bit Cover)

import triangle from './triangle'
import sine from './sine'
import square from './square'
import noise from './noise'
import brownNoise from './brownNoise'
import drum from './drum'

export default {
  id: 'thingsThingsICannotDescribe',
  length: 241.491,
  loop: true,
  tracks: {
    triangle,
    sine,
    square,
    noise,
    brownNoise,
    drum
  },
  init: SNDTRCK => {
    SNDTRCK.devices.triangleSynth.envelope.release = 16
    SNDTRCK.devices.sineSynth.envelope.release = 16
    SNDTRCK.devices.squareSynth.envelope.release = 16
    SNDTRCK.devices.triangleSynth.set({
      detune: 40
    })
    SNDTRCK.devices.sineSynth.set({
      detune: 40
    })
    SNDTRCK.devices.squareSynth.set({
      detune: 40
    })
  },
  deinit: SNDTRCK => {
    SNDTRCK.devices.triangleSynth.set({
      detune: 0
    })
    SNDTRCK.devices.sineSynth.set({
      detune: 0
    })
    SNDTRCK.devices.squareSynth.set({
      detune: 0
    })
  }
}