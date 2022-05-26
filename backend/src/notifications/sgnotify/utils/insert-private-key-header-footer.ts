export const insertECPrivateKeyHeaderAndFooter = (key: string): string => {
  return (
    '-----BEGIN EC PRIVATE KEY-----\n' + key + '\n-----END EC PRIVATE KEY-----'
  )
}
