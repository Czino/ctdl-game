// Czino - Floating Blanket

import triangle from './triangle'
import square from './square'
import sine from './sine'
import drum from './drum'

export default {
  id: 'floatingBlanket',
  length: 96,
  loop: true,
  tracks: {
    triangle,
    square,
    sine,
    drum
  }
}