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
  <h2>All Songs</h2>
  <div v-for="song in songs" :key="song.id">
    <router-link :to="`/songs/${song.id}`"> {{ song.name }}</router-link>
    by {{ song.artist }}
  </div>
  <br />
  <br />
  <br />
  <iframe
    src="https://docs.google.com/forms/d/e/1FAIpQLSdQQPYvvQwrc7og2qAJsWzAvZTjE3arYmWraPVS4PrLOLbetA/viewform?embedded=true"
    width="640"
    height="800"
    frameborder="0"
    marginheight="0"
    marginwidth="0"
    >Loading…</iframe
  >
</template>
