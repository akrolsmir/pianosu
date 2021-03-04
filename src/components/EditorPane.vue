<template>
  <div>
    <br />
    <input v-model="version" />
    <button @click="uploadTrack">Upload Your Track</button>
    <!-- {{ JSON.stringify(songDetails, null, 2) }} -->
  </div>
</template>

<script>
import { customAlphabet } from 'nanoid'
import { setSong } from './network'

const base62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZbcdefghijklmnopqrstuvwxyz'
const nanoid = customAlphabet(base62, 8)

// Turns "This is @NOT okay" to "this-is-not-okay
// Good for making URLs from user input (TODO: try foreign chars)
function sanitize(input) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s/g, '-') // whitespace
    .replace(/[^\p{L}-]/gu, '') // not (dash or letter in any language)
}

export default {
  props: {
    getDetails: Function,
  },
  data() {
    return {
      songDetails: {},
      version: 'vocals',
    }
  },
  methods: {
    async uploadTrack() {
      // Kind of convoluted pattern because not sure adding reactivity to songDetails is right...
      // But maybe that's a premature optimization.
      this.songDetails = this.getDetails()
      const rawId = `${this.songDetails.title}-${this.version}-${nanoid()}`
      this.songDetails.id = sanitize(rawId)
      this.songDetails.version = this.version
      this.songDetails.lastUpdateTime = Date.now()

      await setSong(this.songDetails)
      console.log('Uploaded!', this.songDetails.id) // TODO: navigate to this song instead
    },
  },
}
</script>
