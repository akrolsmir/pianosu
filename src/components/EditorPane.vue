<template>
  <div>
    <br />
    <button @click="saveTrack">Save this version</button>
    &nbsp;
    <input v-model="version" />
    <button @click="newTrack">Save as new version</button>
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
    async saveTrack() {
      // TODO: Maybe don't overwrite entirely in the future...
      this.songDetails = this.getDetails()
      this.songDetails.lastUpdateTime = Date.now()

      await setSong(this.songDetails)
      // For now, just refresh the page to get the changes
      this.$router.go()
    },
    async newTrack() {
      // Kind of convoluted pattern because not sure adding reactivity to songDetails is right...
      // But maybe that's a premature optimization.
      this.songDetails = this.getDetails()
      const readableId = sanitize(`${this.songDetails.title}-${this.version}`)
      this.songDetails.id = `${readableId}-${nanoid()}`
      this.songDetails.version = this.version
      this.songDetails.lastUpdateTime = Date.now()

      await setSong(this.songDetails)
      this.$router.push(`/songs/${this.songDetails.id}`)
    },
  },
}
</script>
