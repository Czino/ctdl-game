// Los Kjarkas - Llorando Se Fue (Czino 8-bit remix)

import triangle from './triangle'
import sine from './sine'
import pulse from './pulse'
import noise from './noise'
import brownNoise from './brownNoise'
import drum from './drum'

export default {
  id: 'lambada',
  length: 80,
  loop: true,
  tracks: {
    triangle,
    square: pulse,
    sine,
    brownNoise: noise,
    noise: brownNoise,
    drum
  },
  init: SNDTRCK => {
    SNDTRCK.devices.noiseSynth.envelope.release = 0
  }
}