// Czino - Back From War

import pulse from './pulse'
import pulse2 from './pulse2'
import drum from './drum'

export default {
  id: 'backFromWar',
  length: 10.4 + 0.7874,
  loop: true,
  tracks: {
    pulse,
    pulse2,
    drum: drum,
    noise: drum
  }
}