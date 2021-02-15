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

// Mapped into C Major.
// TODO: Missing 16ths, and some notes are missing or off:
// - F should be sharp?
// - B4 should go down an octave
export const summertimeVoice = '\
| GGEAGEC|D DCDDCD| D DAGEC|D D DDED|\
| C A GEC|D D D CD| E D C E|        |\
| GGEAGEC|D DCDDCD| D DAGEC|DDDDDDDF|\
| E   CDE| CDE EFG| E C D C|        |\
| GGEAGEC|D DCDDCD| D EAGEC|D DCDDED|\
| C A GEC|D DCD CD| E D C B|C       |'

  .split('')
  .filter((char) => char != '|')
  .map((char) => (char == ' ' ? '' : `${char}4`))

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
  bpm: 125,
  voice: summertimeVoice,
  transposeFunc: transposeCtoD,
  keyboard: {
    A3: 'A',
    B3: 'S',
    C4: 'D',
    D4: 'F',
    E4: 'J',
    F4: 'K',
    G4: 'L',
    A4: ';',
    B4: "'",
  },
  offset: 965,
  soundFile: 'Summertime45.mp3',
}