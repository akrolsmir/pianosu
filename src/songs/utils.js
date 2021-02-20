// Converts a string like '|EECA A D|' to an array like:
// ['E4', 'E4', 'C4', ...]
export function eigthsToArray(eigths) {
  return eigths
    .split('')
    .filter((char) => char != '|')
    .map((char) => (char == ' ' ? '' : `${char}4`))
}

// Get the frequency distribution of each note
export function countNotes(notes) {
  return notes.reduce((acc, n) => ((acc[n] = (acc[n] || 0) + 1), acc), {})
}

// Print the notes to play as as a string
export function printKeys(keybinding, notes) {
  const pToK = invert(summertimeDetails.keybinding)
  const keys = notes.map((note) => (note ? pToK[note] : ' '))
  // TODO: break up into bars (8 notes)
  return keys.join('')
}

export function invert(obj) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]))
}
