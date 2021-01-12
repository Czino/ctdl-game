// Czino - Finn's Vocoder

import triangle from './triangle'
import square from './square'
import sine from './sine'
import pulse from './pulse'
import drum from './drum'
import noise from './noise'
import brownNoise from './brownNoise'

export default {
  id: 'finnsVocoder',
  length: 109.714,
  loop: true,
  tracks: {
    triangle,
    square,
    sine,
    pulse,
    drum,
    noise,
    brownNoise
  }
}