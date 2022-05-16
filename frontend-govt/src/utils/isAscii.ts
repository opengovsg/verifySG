// a similar function exists in class-validator; to use that if we use that library on frontend
export const isAscii = (str: string) => {
  return /^[\x00-\x7F]*$/.test(str)
}
