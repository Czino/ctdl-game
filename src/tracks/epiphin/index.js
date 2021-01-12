// Czino - Epiphin

import triangle from './triangle'
import sine from './sine'
import pulse from './pulse'
import drum from './drum'
import noise from './noise'
import brownNoise from './brownNoise'

const unique = () => {
  return (obj, index, self) => self.findIndex(s => s[0] === obj[0]) === index
}

export default {
  id: 'epiphin',
  length: 171.9402 + 1.3433,
  loop: true,
  tracks: {
    triangle,
    sine,
    pulse,
    drum: pulse.concat(drum).filter(unique),
    noise,
    brownNoise: brownNoise
  },
  init: SNDTRCK => {
    SNDTRCK.devices.triangleSynth.portamento = .1
  },
  deinit: SNDTRCK => {
    SNDTRCK.devices.triangleSynth.portamento = 0
  }
}