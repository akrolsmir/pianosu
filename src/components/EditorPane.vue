<template>
  <div>
    <br />
    <input v-model="versionName" />
    <button @click="uploadTrack">Upload Your Track</button>
    <!-- {{ JSON.stringify(songDetails, null, 2) }} -->
  </div>
</template>

<script>
import { customAlphabet } from 'nanoid'

const base62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZbcdefghijklmnopqrstuvwxyz'
const nanoid = customAlphabet(base62, 8)

export default {
  props: {
    getDetails: Function,
  },
  data() {
    return {
      songDetails: {},
      versionName: nanoid(),
    }
  },
  methods: {
    uploadTrack() {
      this.songDetails = this.getDetails()
      // TODO upload to Firestore
    },
  },
}
</script>
