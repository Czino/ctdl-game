const fs = require('fs')
const songName = process.argv[2]
const jsonTrack = JSON.parse(
  fs.readFileSync(`./tmp/${songName}.json`, { encoding: 'utf8' })
)
jsonTrack.tracks.forEach(track => {
  const name = track.name
  const notes = track.notes
  const timesSeen = []
  const parsedNotes = notes
    .map(note => ([
      Math.round(note.time * 10000) / 10000,
      Math.round(note.duration * 10000) / 10000,
      note.name,
      Math.round(note.velocity * 10000) / 10000
    ]))
    .reverse()
    .filter(note => {
      const result = timesSeen.indexOf(note[0]) === -1
      timesSeen.push(note[0])
      return result
    })
    .reverse()

  if(!fs.existsSync(`./src/tracks/${songName}`)) fs.mkdirSync(`./src/tracks/${songName}`)

  if (parsedNotes.length === 0) return

  fs.writeFileSync(
    `./src/tracks/${songName}/${name}.js`,
    'export default ' + JSON.stringify(parsedNotes)
  )
})

