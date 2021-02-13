// ~120 BPM, so each 8th note = ~100 * 1/400ths of a second

// Maps each tick (1/400sec) to a frequency (hertz)
export default {
  90: '',
  180: '400', // G4 392
  280: '400', // G4 392
  380: '340', // E4 330
  480: '450', // A4 440
  580: '400', // G4 392
  680: '340', // E4 330
  780: '270', // C4 262
  880: '300', // D4 294
}

export const summertimeVoice = ' GGEAGEC|D DCDDCD| D DAGEC|D D DDED| CA GECD| D D CD |E D C E |       '
  .split('')
  .filter((char) => char != '|')
  .map((char) => (char == ' ' ? '' : `${char}4`))
