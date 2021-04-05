<script>
import { listSongs } from './network.js'

export default {
  data: () => ({ songs: [] }),
  async created() {
    this.songs = await listSongs(/* fillTracks = */ true)
  },
}
</script>

<template>
  <h2>Song Versions</h2>
  <div v-for="song in songs" :key="song.id">
    <router-link :to="`/songs/${song.id}`"> {{ song.name }}</router-link>
    {{ song.name }} mapped by Austin
  </div>
</template>
