// Alfonso X, el Sabio (1221-1284) Spanish: Santa Maria Strela do dia

import noise from './noise'
import pulse from './pulse'
import sine from './sine'

export default {
  noise,
  pulse,
  sine
}

window.SNDTRCK.song = {
  id: 'santaMaria',
  length: 79.7342,
  reverbs: [window.SNDTRCK.devices.sineSynth],
  loop: true,
  tracks: {
    noise: noise,
    triangle: pulse,
    sine: sine,
  }
}