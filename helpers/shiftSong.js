const fs = require('fs')
const songName = process.argv[2]
const shiftBy = process.argv[3]
const track = process.argv[4]
const notes = JSON.parse(
  fs.readFileSync(`./src/tracks/${songName}/${track}.js`, {
    encoding: 'utf8'
  }).replace('export default ', '')
)

const shiftSong = (notes, offset) => notes.map(note => {
  note[0] = Math.round((note[0] - offset) * 10000) / 10000
  return note
})

const shiftedTrack = shiftSong(notes, shiftBy)
fs.writeFileSync(
  `./src/tracks/${songName}/${track}.js`,
  'export default ' + JSON.stringify(shiftedTrack)
)