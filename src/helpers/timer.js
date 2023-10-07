/**
 * Format seconds into a string minutes:seconds
 * @param {number} seconds
 */

const formatTimer = (seconds) => {
  let minutes = parseInt(seconds / 60).toString()
  seconds = parseInt(seconds % 60).toString()

  let output = minutes >= 10 ? `${minutes}` : `0${minutes}`
  output += seconds >= 10 ? `:${seconds}` : `:0${seconds}`

  return output
}

const timeStringToSecond = (timeString) => {
  if (!timeString) {
    return 0
  }
  const [hours, minutes, secondsAndMilliseconds] = timeString.split(':')
  const [seconds, milliseconds] = secondsAndMilliseconds.split(',')
  return (
    parseInt(hours) * 3600 +
    parseInt(minutes) * 60 +
    parseInt(seconds) +
    parseFloat(`0.${milliseconds}`)
  )
}

export { formatTimer, timeStringToSecond }
