// Czino - Boss Theme

import triangle from './triangle'
import square from './square'
import sine from './sine'
import pulse from './pulse'
import noise from './noise'
import drum from './drum'

export default {
  id: 'bossTheme',
  length: 78.146,
  loop: true,
  tracks: {
    triangle,
    square,
    sine,
    pulse,
    noise,
    drum
  },
  reverbs: ['sineSynth', 'squareSynth', 'pulseSynth', 'noiseSynth']
}