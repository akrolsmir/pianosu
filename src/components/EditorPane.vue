<template>
  <div>
    <h2>Song Editor</h2>
    <!-- Song metadata -->
    ID <input v-model="songDetails.id" /><br /><br />
    Title <input v-model="songDetails.title" />&nbsp; Artist
    <input v-model="songDetails.artist" /><br /><br />
    BPM <input v-model.number="songDetails.bpm" />&nbsp; Offset
    <input v-model.number="songDetails.offset" /><br /><br />
    <!-- TODO: add notes -->
    <!-- Song blobs -->
    Audio: <input ref="audio" type="file" accept="audio/*" /><br />
    Image: <input ref="image" type="file" accept="image/*" /><br />
    <button @click="uploadAll">Upload audio and image</button><br /><br />
    <!-- Save info -->
    <button @click="saveTrack">Save this version</button>
    &nbsp;
    <button @click="newTrack">Save as new version</button>
    <input v-model="version" /><br /><br />
  </div>
</template>

<script>
import { customAlphabet } from 'nanoid'
import { setSong, updateSong, uploadAs } from './network'

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
    getTrack: Function,
    songDetails: Object,
  },
  data() {
    return {
      version: 'vocals',
    }
  },
  methods: {
    async saveTrack() {
      // TODO: Maybe don't overwrite entirely in the future...
      this.songDetails.track = this.getTrack()
      this.songDetails.lastUpdateTime = Date.now()

      await setSong(this.songDetails)
      // For now, just refresh the page to get the changes
      this.$router.go()
    },
    async newTrack() {
      // Kind of convoluted pattern because not sure adding reactivity to songDetails is right...
      // But maybe that's a premature optimization.
      this.songDetails.track = this.getTrack()
      const readableId = sanitize(`${this.songDetails.title}-${this.version}`)
      this.songDetails.id = `${readableId}-${nanoid()}`
      this.songDetails.version = this.version
      this.songDetails.lastUpdateTime = Date.now()

      await setSong(this.songDetails)
      this.$router.push(`/songs/${this.songDetails.id}`)
    },
    async uploadAll() {
      const toUpdate = {}
      const id = this.songDetails.id
      const audioFile = this.$refs.audio.files[0]
      if (audioFile) {
        toUpdate.songFile = await uploadAs(id, audioFile, 'audio.mp3')
      }

      const bgImage = this.$refs.image.files[0]
      if (bgImage) {
        toUpdate.backgroundImage = await uploadAs(id, bgImage, 'bg.jpg')
      }

      await setSong(this.songDetails) // TODO: Remove once all songs are initialized in Firestore
      await updateSong(id, toUpdate)
    },
  },
}
</script>
