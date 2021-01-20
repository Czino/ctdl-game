// Czino - Mempool

// Transactions (k) in Mempool from 13.01.2021 - 20.01.2021
const txInMempool = [39,39,37,34,35,32,33,30,33,33,36,34,36,35,34,31,28,30,30,31,31,34,36,34,38,42,39,41,41,40,37,37,36,35,34,35,37,35,38,44,47,50,50,56,55,58,56,54,52,55,50,50,47,50,50,49,51,53,53,48,61,58,57,53,64,62,60,55,49,47,44,49,47,43,43,41,39,37,38,40,38,36,36,32,40,39,39,34,35,31,29,28,29,29,31,28,29,30,34,35,40,38,37,37,37,37,40,40,39,38,41,49,53,49,52,58,55,56,54,57,58,54,52,47,49,49,53,47,51,49,50,47,51,46,40,40,39,44,51,45,44,43,39,38,39,40,36,34,31,35,31,29,34,34,29,32,29,29,30,31,29,28,27,29,34,34,31,30,31,29,29,30,30,30,30,31,30,38,34,34,36,38,38,41,44,50,49,46,44,47,44,45,47,48,50,46,46,46,44,44,51,49,49,45,43,44,42,43,44,50,49,46,44,43,47,44,45,44,45,46,46,46,49,50,58,55,52,51,51,58,56,53,53,52,54,55,55,53,52,55,54,54,53,55,62,60,57,56,53,55,52,51,53,53,51,54,52,54,52,54,57,58,65,60,59,59,59,54,55,62,60,58,53,52,58,53,52,56,51,53,57,58,53,51,54,51,55,53,53,63,62,57,56,56,54,56,59,59,55,58,58,57,57,55,55,55,56,57,59,59,57,59,63,65,72,70,73,70,72,74,82,77,76,74,84,84,89,93,98,96,95,90,91,88,88,82,86,87,90,83,86,84,86,88,88,90,85,83,83,80,78,75,78,81,82,77,75,72,69,75,72,70,65,65,65,72,72,73,73,78,76,78,77,76,79,81,80,83,88,89,87,88,87,90,93,94,90,92,99,98,97,97,101,99,106,101,98,99,94,93,89,94,95,94,94,93,87,84,86,86,79,80,74,76,72,72,78,75,72,70,66,66,64,59,69,65,70,70,65,67,65,67,65,63,61,60,64,63,63,64,65,66,67,67,69,75,80,81,81,77,81,83,84,86,87,91,93,88,83,85,83,85,83,77,78,78,81,80,77,73,73,76,75,80,78,77,74,73,74,70]

const notes = ['C#', 'E', 'F#', 'A', 'B']
// give each height a specific note
let sine = txInMempool.map((txCount, i) => [
  i * 0.25,
  0.125,
  notes[txCount % 5] + ((Math.round(txCount / 100) % 5) + 2),
  Math.round(Math.random() * 0.2 * 100 + 10) / 100
])
export default {
  id: 'mempool',
  length: txInMempool.length * 0.25,
  bpm: 120,
  delay: 0.250,
  delayFeedback: .8,
  delays: [
    'sineSynth'
  ],
  loop: true,
  tracks: {
    sine: sine
  }
}