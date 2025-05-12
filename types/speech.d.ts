/* eslint-disable @typescript-eslint/no-explicit-any */
declare interface Window {
  webkitSpeechRecognition: any
  SpeechRecognition: any
}

declare let webkitSpeechRecognition: any
declare let SpeechRecognition: any

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionEvent {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}
