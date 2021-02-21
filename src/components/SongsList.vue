<script>
import { summertimeDetails } from '../songs/summertime.js'
import { takeonmeDetails } from '../songs/take-on-me.js'

export const SONGS = [summertimeDetails, takeonmeDetails]

export default {
  data: () => ({ songs: SONGS }),
}
</script>

<template>
  <h2>All Songs</h2>
  <div v-for="song in songs">
    <router-link :to="`/songs/${song.id}`">{{ song.title }}</router-link> by
    {{ song.artist }}
  </div>
</template>
