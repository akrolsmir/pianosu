<script>
import { summertimeDetails } from '../songs/summertime.js'
import { takeonmeDetails } from '../songs/take-on-me.js'
import { listSongs } from './network.js'

export const SONGS = [summertimeDetails, takeonmeDetails]

export default {
  data: () => ({ songs: SONGS, versions: [] }),
  async created() {
    this.versions = await listSongs()
  },
}
</script>

<template>
  <h2>All Songs</h2>
  <div v-for="song in songs" :key="song.id">
    <router-link :to="`/songs/${song.id}`">{{ song.title }}</router-link> by
    {{ song.artist }}
  </div>

  <h2>Song Versions</h2>
  <div v-for="song in versions" :key="song.id">
    <router-link :to="`/songs/${song.id}`"> {{ song.version }}</router-link>
    {{ song.title }} mapped by Austin
  </div>
</template>
