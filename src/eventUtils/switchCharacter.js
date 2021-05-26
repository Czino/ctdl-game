import { addHook, CTDLGAME } from '../gameUtils'

export const switchCharacter = () => {
  addHook(CTDLGAME.frame, () => {
    if (!CTDLGAME.preventCharacterSwitch && window.SELECTEDCHARACTER.id === 'hodlonaut') {
      CTDLGAME.katoshi.choose()
    } else {
      CTDLGAME.hodlonaut.choose()
    }
  })
}