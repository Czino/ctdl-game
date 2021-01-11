// Czino - Craig's Castle

import triangle from './triangle'
import sine from './sine'
import pulse from './pulse'
import drum from './pulse'

export default {
  id: 'craigsCastle',
  length: 48,
  loop: true,
  tracks: {
    triangle: triangle,
    sine: sine,
    pulse,
    drum: drum
  }
}