
const notes = [
  'C0',
  'D0',
  'E0',
  'F0',
  'G0',
  'A0',
  'B0',
  'C1',
  'D1',
  'E1',
  'F1',
  'G1',
  'A1',
  'B1',
  'C2',
  'D2',
  'E2',
  'F2',
  'G2',
  'A2',
  'B2',
  'C3',
  'D3',
  'E3',
  'F3',
  'G3',
  'A3',
  'B3',
  'C4',
  'D4',
  'E4',
  'F4',
  'G4',
  'A4',
  'B4',
  'C5',
  'D5',
  'E5',
  'F5',
  'G5',
  'A5',
  'B5',
  'C6',
  'D6',
  'E6',
  'F6',
  'G6',
  'A6',
  'B6',
  'C7',
  'D7',
  'E7',
  'F7',
  'G7',
  'A7',
  'B7',
  'C8',
  'D8',
  'E8',
  'F8',
  'G8',
  'A8',
  'B8',
  'C9',
  'D9',
  'E9',
  'F9',
  'G9',
  'A9',
  'B9',
]
const dieSynths = [
  'pulseSynth',
  'pulse2Synth',
  'squareSynth',
  'triangleSynth',
  'sineSynth',
  // 'drumSynth',
  // 'noiseSynth',
  // 'brownNoiseSynth'
]

const recorder = new Recorder()
SNDTRCK.synths.map(synth =>
  synth.disconnect() && synth.chain(SNDTRCK.devices.gain, recorder)
)
setTimeout(async () => {

  for (let synth of dieSynths) {
    for (let note of notes) {
      recorder.start()

      if (synth === 'drumSynth') {
        SNDTRCK.devices.drumSynth.triggerAttackRelease(note, .10, now(), 1)
        SNDTRCK.devices.drumSynth.triggerAttackRelease('D1', .10, now() + 0.01, 1)
      } else if (/noise/i.test(synth)) {
        SNDTRCK.devices[synth].triggerAttack()
      } else {
        SNDTRCK.devices.drumSynth.triggerAttack(note, 1)
      }
      await sleep(1000)
      SNDTRCK.devices[synth].triggerRelease()
      // the recorded audio is returned as a blob
      const recording = await recorder.stop()
      // download the recording by creating an anchor element and blob url
      const url = URL.createObjectURL(recording)
      const anchor = document.createElement("a")
      anchor.download = `${synth}-${note}.webm`
      anchor.href = url
      anchor.click()
    }
  }

  return
}, 1000)

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}