// Courtesy of https://pianoletternotes.blogspot.com/2018/02/take-on-me-by-ha.html

import { countNotes, eigthsToArray, printKeys } from './utils'

// Mapped into G major, but isn't using any flats.
// TODO: Some notes are missing or off:
// The A's in each of the first beats should be A3 instead of A4.
// F's should be sharps, hack around that by transcoding themto F#4.
export const takeonmeEightsInG =
  '\
|EECA A D| D DFFGA|GGGD C E| E EDDED|\
|EECA A D| D DFFGA|GGGD C E| E EDDED|\
|EECA A D| D DFFGA|GGGE C E| E EDDD |\
|        |C  C BA |        | BBB  BG|\
|   E| AE D C | CCB    |   B  CB|'

export function transposeToG(note) {
  const toG = {
    // B3: 'B3',
    C4: 'C4',
    D4: 'D4',
    E4: 'E4',
    F4: 'F#4',
    G4: 'G4',
    A4: 'A4',
    B4: 'B3',
    // C5: 'C4',
  }
  return note && toG[note]
}

export const takeonmeDetails = {
  id: 'take-on-me',
  title: 'Take On Me',
  artist: 'a-ha',
  youtubeUrl: 'https://www.youtube.com/watch?v=djV11Xbc914',
  youtubeOffset: 0,

  bpm: 145,
  voice: voice(),
  keybinding: {
    A: 'A3',
    S: 'B3',
    D: 'C4',
    F: 'D4',
    J: 'E4',
    K: 'F#4',
    L: 'G4',
    SEMICOLON: 'A4',
  },
  soundFile: 'Takeonme21.mp3',
  offset: 1100,
  // soundFile: 'Takeonme60.ogg',
  // offset: 50,
}

function voice() {
  // return eigthsToArray(takeonmeEightsInG).map(transposeToG)
  return [
    'E4',
    'E4',
    'C4',
    'A3',
    '',
    'A3',
    '',
    'D4',
    '',
    'D4',
    '',
    'D4',
    'F#4',
    'F#4',
    'G4',
    'A4',
    'G4',
    'G4',
    'G4',
    'D4',
    '',
    'C4',
    '',
    'E4',
    '',
    'E4',
    '',
    'E4',
    'D4',
    'D4',
    'E4',
    'D4',
    'E4',
    'E4',
    'C4',
    'A3',
    '',
    'A3',
    '',
    'D4',
    '',
    'D4',
    '',
    'D4',
    'F#4',
    'F#4',
    'G4',
    'A4',
    'G4',
    'G4',
    'G4',
    'D4',
    '',
    'C4',
    '',
    'E4',
    '',
    'E4',
    '',
    'E4',
    'D4',
    'D4',
    'E4',
    'D4',
    'E4',
    'E4',
    'C4',
    'A3',
    '',
    'A3',
    '',
    'D4',
    '',
    'D4',
    '',
    'D4',
    'F#4',
    'F#4',
    'G4',
    'A4',
    'G4',
    'G4',
    'G4',
    'E4',
    '',
    'C4',
    '',
    'E4',
    '',
    'E4',
    '',
    'E4',
    'D4',
    'D4',
    'D4',
    '',
  ]
}

// console.log(eigthsToArray(takeonmeEightsInG))
// console.log(countNotes(voice()))
// console.log(printKeys(voice()))
