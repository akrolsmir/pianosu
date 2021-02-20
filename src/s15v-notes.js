// Try to get notes out of summertime15-voice.js
// ~120 BPM, so each 8th note = ~100 * 1/400ths of a second
// Maps each tick (1/400sec) to a frequency (hertz)
// export default {
//   90: '',
//   180: '400', // G4 392
//   280: '400', // G4 392
//   380: '340', // E4 330
//   480: '450', // A4 440
//   580: '400', // G4 392
//   680: '340', // E4 330
//   780: '270', // C4 262
//   880: '300', // D4 294
// }

// Mapped into C Major as 8th notes.
// TODO: Missing 16ths, and some notes are missing or off:
// - F should be sharp?
// - B4 should go down an octave
export const summertimeEighthsInC =
  '\
| GGEAGEC|D DCDDCD| D DAGEC|D D DDED|\
| C A GEC|D D D CD| E D C E|        |\
| GGEAGEC|D DCDDCD| D DAGEC|DDDDDDDF|\
| E   CDE| CDE EFG| E C D C|        |\
| GGEAGEC|D DCDDCD| D EAGEC|D DCDDED|\
| C A GEC|D DCD CD| E D C B|C       |'

function eigthsToArray(eigths) {
  return eigths
    .split('')
    .filter((char) => char != '|')
    .map((char) => (char == ' ' ? '' : `${char}4`))
}

export function transposeCtoD(note) {
  const cToD = {
    A3: 'B3',
    B3: 'C#4',
    C4: 'D4',
    D4: 'E4',
    E4: 'F#4',
    F4: 'G4',
    G4: 'A4',
    A4: 'B4',
    B4: 'C#5',
  }
  return note && cToD[note]
}

export const summertimeDetails = {
  id: 'summertime',
  title: 'Summertime (하계)',
  artist: 'Maggie & Nyan',
  youtubeUrl: 'https://www.youtube.com/watch?v=ymwtuzIdhfY',
  youtubeOffset: 0,

  bpm: 125,
  keybinding: {
    A: 'C#4',
    S: 'D4',
    D: 'E4',
    F: 'F#4',
    J: 'G4',
    K: 'A4',
    L: 'B4',
    ';': 'C#5',
  },
  voice: voice(),
  offset: 965,
  soundFile: 'Summertime45.mp3',
}

// To regenerate voice from the readable summertimeEightsInC:
// console.log(eigthsToArray(summertimeEighthsInC).map(transposeCtoD))

function voice() {
  return [
    '',
    'A4',
    'A4',
    'F#4',
    'B4',
    'A4',
    'F#4',
    'D4',
    'E4',
    '',
    'E4',
    'D4',
    'E4',
    'E4',
    'D4',
    'E4',
    '',
    'E4',
    '',
    'E4',
    'B4',
    'A4',
    'F#4',
    'D4',
    'E4',
    '',
    'E4',
    '',
    'E4',
    'E4',
    'F#4',
    'E4',
    '',
    'D4',
    '',
    'B4',
    '',
    'A4',
    'F#4',
    'D4',
    'E4',
    '',
    'E4',
    '',
    'E4',
    '',
    'D4',
    'E4',
    '',
    'F#4',
    '',
    'E4',
    '',
    'D4',
    '',
    'F#4',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'A4',
    'A4',
    'F#4',
    'B4',
    'A4',
    'F#4',
    'D4',
    'E4',
    '',
    'E4',
    'D4',
    'E4',
    'E4',
    'D4',
    'E4',
    '',
    'E4',
    '',
    'E4',
    'B4',
    'A4',
    'F#4',
    'D4',
    'E4',
    'E4',
    'E4',
    'E4',
    'E4',
    'E4',
    'E4',
    'G4',
    '',
    'F#4',
    '',
    '',
    '',
    'D4',
    'E4',
    'F#4',
    '',
    'D4',
    'E4',
    'F#4',
    '',
    'F#4',
    'G4',
    'A4',
    '',
    'F#4',
    '',
    'D4',
    '',
    'E4',
    '',
    'D4',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'A4',
    'A4',
    'F#4',
    'B4',
    'A4',
    'F#4',
    'D4',
    'E4',
    '',
    'E4',
    'D4',
    'E4',
    'E4',
    'D4',
    'E4',
    '',
    'E4',
    '',
    'F#4',
    'B4',
    'A4',
    'F#4',
    'D4',
    'E4',
    '',
    'E4',
    'D4',
    'E4',
    'E4',
    'F#4',
    'E4',
    '',
    'D4',
    '',
    'B4',
    '',
    'A4',
    'F#4',
    'D4',
    'E4',
    '',
    'E4',
    'D4',
    'E4',
    '',
    'D4',
    'E4',
    '',
    'F#4',
    '',
    'E4',
    '',
    'D4',
    '',
    'C#4',
    'D4',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
  ]
}

function countNotes(notes) {
  return notes.reduce((acc, n) => ((acc[n] = (acc[n] || 0) + 1), acc), {})
}

// Get the frequency distribution of each note
// console.log(countNotes(voice()))

// Print the notes to play as as a string
const pToK = invert(summertimeDetails.keybinding)
const keys = voice().map((note) => (note ? pToK[note] : ' '))
// console.log(keys.join('')) // TODO: break up into bars (8 notes)

function invert(obj) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]))
}
