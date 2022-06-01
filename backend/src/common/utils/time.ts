export const convertMillisecondsToMinutes = (milliseconds: number): number => {
  return Math.floor(milliseconds / (1000 * 60))
}
