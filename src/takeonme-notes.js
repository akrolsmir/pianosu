// Courtesy of https://pianoletternotes.blogspot.com/2018/02/take-on-me-by-ha.html

// Mapped into G major, but isn't using any flats.
// TODO: Some notes are missing or off:
// The A's in each of the first beats should be A3 instead of A4.
// F's should be sharps, hack around that by transcoding themto F#4.
export const takeonmeVoice = '\
|EECA A D| D DFFGA|GGGD C E| E EDDED|\
|EECA A D| D DFFGA|GGGD C E| E EDDED|\
|EECA A D| D DFFGA|GGGE C E| E EDDD |'

  .split('')
  .filter((char) => char != '|')
  .map((char) => (char == ' ' ? '' : `${char}4`))

export function transposeToG(note) {
  const toG = {
    B3: 'B3',
    C4: 'C4',
    D4: 'D4',
    E4: 'E4',
    F4: 'F#4',
    G4: 'G4',
    A4: 'A4',
    B4: 'B4',
    C5: 'C4',
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
  voice: takeonmeVoice,
  transposeFunc: transposeToG,
  keyboard: {
    //A3: 'A',
    // NOTE: Skip mapping A3 b/c first key is drawn based off of index in array, that
    // way B3 will reflect where it'd be on the keyboard.
    B3: 'A',
    C4: 'S',
    D4: 'D',
    E4: 'F',
    F4: 'J',
    G4: 'K',
    A4: 'L',
    B4: ';',
    C5: "'",
  },
  offset: 1100,
  soundFile: 'Takeonme21.mp3',
}
