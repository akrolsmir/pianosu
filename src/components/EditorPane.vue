<template>
  <div>
    <h2>Song Editor</h2>
    <!-- Song metadata -->
    ID
    <input v-model="songDetails.id" style="width: 340px" disabled /><br /><br />
    Title <input v-model="songDetails.title" />&nbsp; Artist
    <input v-model="songDetails.artist" /><br /><br />
    BPM <input v-model.number="songDetails.bpm" />&nbsp; Offset
    <input v-model.number="songDetails.offset" /><br /><br />
    Notes: <input v-model="notesString" style="width: 340px" /><br />
    Keys: <input v-model="keyString" style="width: 340px" /><br /><br />
    <!-- Song blobs -->
    Audio: <input @change="setAudioFiles" type="file" accept="audio/*" /><br />
    Image: <input @change="setImageFiles" type="file" accept="image/*" /><br />
    <audio controls :src="audioSrc" />
    <img :src="imageSrc" width="200" /><br />
    <!-- <button @click="uploadAll">Upload audio and image</button> &nbsp; -->
    <button @click="createSong">Create new song!</button><br /><br />
    <progress v-if="uploadState === 'UPLOADING'" />
    <!-- Save info -->
    <h3>Track</h3>
    <button @click="saveTrack">Update this track</button>
    &nbsp;
    <button @click="newTrack">Save as new track</button>
    <input v-model="version" /><br /><br />
  </div>
</template>

<script>
import { customAlphabet } from 'nanoid'
import { getSong, setSong, updateSong, uploadAs } from './network'

const base62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZbcdefghijklmnopqrstuvwxyz'
const nanoid4 = customAlphabet(base62, 4)

// Turns "This is @NOT okay" to "this-is-not-okay
// Good for making URLs from user input (TODO: try foreign chars)
function sanitize(input) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s/g, '-') // whitespace
    .replace(/[^\p{L}-]/gu, '') // not (dash or letter in any language)
    .slice(0, 100) // Cap at 100 chars
}

export default {
  props: {
    getTrack: Function,
    songDetails: Object,
  },
  data() {
    return {
      uploadState: 'NOT_STARTED', // or 'UPLOADING' or 'DONE'
      version: 'vocals',
      audioFiles: [],
      imageFiles: [],
    }
  },
  computed: {
    notesString: {
      get() {
        return this.songDetails.notes?.join(', ')
      },
      set(value) {
        this.songDetails.notes = value.split(', ')
      },
    },
    keyString: {
      get() {
        return this.songDetails.keys?.join(', ')
      },
      set(value) {
        this.songDetails.keys = value.split(', ')
      },
    },
    // Preview the uploaded files, or else the original image
    audioSrc() {
      if (this.audioFiles[0]) {
        return URL.createObjectURL(this.audioFiles[0])
      }
      return this.songDetails.soundFile
    },
    imageSrc() {
      if (this.imageFiles[0]) {
        return URL.createObjectURL(this.imageFiles[0])
      }
      return this.songDetails.backgroundImage
    },
  },
  methods: {
    setAudioFiles(event) {
      this.audioFiles = event.target.files
    },
    setImageFiles(event) {
      this.imageFiles = event.target.files
    },
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
      this.songDetails.id = `${readableId}-${nanoid4()}`
      this.songDetails.version = this.version
      this.songDetails.lastUpdateTime = Date.now()

      await setSong(this.songDetails)
      this.$router.push(`/songs/${this.songDetails.id}`)
    },
    async createSong(allowOverwrite = false) {
      this.uploadState = 'UPLOADING'
      // Song id is sanitized title (plus 4-char nanoid, if collision?)
      // track id is also sanitized track name, plus maybe 4 nanoid
      const toUpdate = {}
      let id = sanitize(this.songDetails.id)

      const existingSong = await getSong(id)
      if (existingSong && !allowOverwrite) {
        alert(`A song with id "${id}" already exists!`)
        id += '-' + nanoid4()
      }

      const audioFile = this.audioFiles[0]
      if (audioFile) {
        toUpdate.soundFile = await uploadAs(id, audioFile, 'audio.mp3')
      }

      const bgImage = this.imageFiles[0]
      if (bgImage) {
        toUpdate.backgroundImage = await uploadAs(id, bgImage, 'bg.jpg')
      }

      await setSong(this.songDetails) // TODO: Remove once all songs are initialized in Firestore
      await updateSong(id, toUpdate)
      this.uploadState = 'DONE'
    },
  },
}
</script>
