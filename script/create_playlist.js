const fs = require('fs')
const path = require('path')
const mp3Duration = require('mp3-duration')

const folderPath =
  '/home/phuoc/Desktop/Development/Pet_Project/vue3-english-player/public/assets/audios/LPTD1.4'

const audioDir = 'LPTD1.4'

// Read the list of files in the folder
fs.readdir(folderPath, (err, files) => {
  if (err) {
    console.log(err)
    return
  }

  // Create an array to hold information about each file
  const fileInfos = []

  // Loop through the list of files and retrieve information about each MP3 file
  files = files.sort((x, y) => {
    const unitX = x.match(/\d+/)
    const unitY = y.match(/\d+/)
    return unitX - unitY
  })
  for (let i = 0; i < files.length; i++) {
    let file = files[i]
    // Only process MP3 files
    if (path.extname(file) !== '.mp3') {
      return
    }

    // Get the full path to the file
    const filePath = path.join(folderPath, file)

    // Get the duration of the file by reading the MP3 header
    mp3Duration(filePath, (err, duration) => {
      if (err) {
        console.log(err)
        return
      }
      // Retrieve information about the file
      const fileInfo = {
        id: i + 1, // The file's index in the list
        title: path.parse(file).name, // The file's name without extension
        seconds: Math.round(duration), // The file's duration (rounded to the nearest integer)
        src: `./assets/audios/${audioDir}/${file}`, // Path to the audio file
        lyric1: ``,
        lyric2: ``
      }
      // Add the file information to the array
      fileInfos.push(fileInfo)
      // If we have retrieved information about all the MP3 files, write the list of files to a JSON file, sorted by id
      if (fileInfos.length === files.filter((f) => path.extname(f) === '.mp3').length) {
        fileInfos.sort((a, b) => a.id - b.id) // Sort the fileInfos array by id
        const songs = `export default ${JSON.stringify(
          fileInfos,
          null,
          2
        )};`
        fs.writeFile('songs.js', songs, (err) => {
          if (err) {
            console.log(err)
            return
          }
          console.log('The list of files has been written to the songs.js module.')
        })
      }
    })
  }
})
