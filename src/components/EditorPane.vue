<template>
  <div>
    <h2>Song Editor</h2>
    <!-- Song metadata -->
    ID
    <input v-model="songId" style="width: 340px" disabled /><br /><br />
    Title <input v-model="song.name" />&nbsp; Artist
    <input v-model="song.artist" /><br /><br />
    BPM <input v-model.number="song.bpm" />&nbsp; Offset
    <input v-model.number="song.offset" /><br /><br />

    <!-- Track metadata -->
    <h3>Track</h3>
    ID <input v-model="trackId" style="width: 340px" disabled /><br /><br />
    Track: <input v-model="track.name" />
    Creator:
    <input v-model="track.creator" /><br /><br />
    Scale: <input v-model="scaleString" style="width: 340px" /><br />
    Keys: <input v-model="keysString" style="width: 340px" /><br /><br />

    <!-- Song blobs -->
    Audio: <input @change="setAudioFiles" type="file" accept="audio/*" /><br />
    Image: <input @change="setImageFiles" type="file" accept="image/*" /><br />
    <audio controls :src="audioSrc" />
    <img :src="imageSrc" width="200" /><br />
    <button @click="updateSong">Update song</button> &nbsp;
    <button @click="createSong">Create new song!</button><br /><br />
    <progress v-if="uploadState === 'UPLOADING'" />

    <!-- TODO Save info -->
    <!-- <button @click="saveTrack">Update this track</button>
    &nbsp;
    <button @click="newTrack">Save as new track</button> -->
  </div>
</template>

<script>
import { customAlphabet } from 'nanoid'
import { getSong, setSong, setTrack, uploadAs } from './network'

const base62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZbcdefghijklmnopqrstuvwxyz'
const nanoid4 = customAlphabet(base62, 4)

// Turns "This is @NOT okay" to "this-is-not-okay
// Good for making URLs from user input (TODO: try foreign chars)
function sanitize(input) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s/g, '-') // Whitespace => dashes
    .replace(/[^-0-9\p{L}]/gu, '') // Not (dash or number or letter in any language)
    .slice(0, 100) // Cap at 100 chars
}

export default {
  props: {
    getPlayedNotes: Function,
    song: Object,
    track: Object,
  },
  data() {
    return {
      uploadState: 'NOT_STARTED', // or 'UPLOADING' or 'DONE'
      audioFiles: [],
      imageFiles: [],
    }
  },
  computed: {
    scaleString: {
      get() {
        return this.track.scale?.join(', ')
      },
      set(value) {
        this.track.scale = value.split(', ')
      },
    },
    keysString: {
      get() {
        return this.track.keys?.join(', ')
      },
      set(value) {
        this.track.keys = value.split(', ')
      },
    },
    // Preview the uploaded files, or else the original image
    audioSrc() {
      if (this.audioFiles[0]) {
        return URL.createObjectURL(this.audioFiles[0])
      }
      return this.song.soundFile
    },
    imageSrc() {
      if (this.imageFiles[0]) {
        return URL.createObjectURL(this.imageFiles[0])
      }
      return this.song.backgroundImage
    },
    songId() {
      // TODO: Debounced check against existing ids; if so, append nanoid
      return sanitize(this.song.name || '')
    },
    trackId() {
      return sanitize(this.track.name || '')
    },
  },
  methods: {
    setAudioFiles(event) {
      this.audioFiles = event.target.files
    },
    setImageFiles(event) {
      this.imageFiles = event.target.files
    },
    async updateSong() {
      // Don't overwrite notes for metadata-only updates
      const playedNotes = this.getPlayedNotes()
      if (playedNotes.length > 0) {
        this.track.notes = playedNotes
      }
      await this.createSong(/* allowOverwrite = */ true)
      this.$router.go()
    },
    async createSong(allowOverwrite = false) {
      this.uploadState = 'UPLOADING'

      // Song id is sanitized title (plus 4-char nanoid, if collision?)
      let id = this.songId
      const existingSong = await getSong(id)
      if (existingSong && !allowOverwrite) {
        alert(`A song with id "${id}" already exists!`)
        id += '-' + nanoid4()
      }
      this.song.id = id
      this.song.lastUpdateTime = Date.now()
      this.track.id = this.trackId
      this.track.lastUpdateTime = Date.now()

      const audioFile = this.audioFiles[0]
      if (audioFile) {
        this.song.audio = await uploadAs(id, audioFile, 'audio.mp3')
      }

      const bgImage = this.imageFiles[0]
      if (bgImage) {
        this.track.bgImage = await uploadAs(id, bgImage, 'bg.jpg')
      }

      await setSong(this.song)
      await setTrack(this.song.id, this.track)
      this.uploadState = 'DONE'

      // TODO: navigate to the song
      // this.$router.push(`/songs/${this.song.id}/${this.track.id}`)
    },
  },
}
</script>
