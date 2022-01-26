export const toFormattedDateTime = (rawDate: string): string => {
  const date = new Date(rawDate)
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  return `${date.getDay()} ${
    monthNames[date.getMonth()]
  } ${date.getFullYear()}, ${date.getHours()}:${date.getMinutes()}`
}
