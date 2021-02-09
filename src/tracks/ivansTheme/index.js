// Czino - Ivan's Theme

import triangle from './triangle'
import sine from './sine'
import square from './square'
import pulse from './pulse'
import pulse2 from './pulse2'

export default {
  id: 'ivansTheme',
  length: 78,
  loop: true,
  tracks: {
    triangle,
    drum: triangle,
    sine,
    square,
    pulse,
    pulse2
  }
}