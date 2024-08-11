import { currentTrack, setCurrentTrack, soundtrack } from "../gameUtils/showStartScreen"

export const handleStartScreenKeyEvents = e => {
  let key = e.key.toLowerCase()
  e.preventDefault()
  if (key === 'arrowdown') {
    const nextSoundTrackIndex = Object.keys(soundtrack).findIndex(key => key === currentTrack)
    setCurrentTrack(Object.keys(soundtrack)[nextSoundTrackIndex + 1])
    window.SNDTRCK.initSoundtrack(currentTrack)
  }
  if (key === 'arrowup') {
    const nextSoundTrackIndex = Object.keys(soundtrack).findIndex(key => key === currentTrack)
    setCurrentTrack(Object.keys(soundtrack)[Math.max(nextSoundTrackIndex - 1, 0)])
    window.SNDTRCK.initSoundtrack(currentTrack)
  }

}

export default handleStartScreenKeyEvents