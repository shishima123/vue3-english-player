import { formatTimer } from './timer'

/**
 * Insert initial songs params
 * @param {array} songs
 */

const threatSongs = (songs) => {
  return songs.map((song) => {
    song['totalTimer'] = formatTimer(song.seconds)

    return song
  })
}

const scrollToActiveElement = (element, activeClass, behavior = 'smooth', block = 'center') => {
  setTimeout(() => {
    let scrollElement = element.querySelector(activeClass)
    if (!scrollElement) {
      return
    }
    scrollElement.scrollIntoView({ behavior, block })
  })
}

export { threatSongs, scrollToActiveElement }
