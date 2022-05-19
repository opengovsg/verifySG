export interface MessageContent {
  type: 'parameter' | 'sentence'
  isLineBreak: boolean
  content: string
}
