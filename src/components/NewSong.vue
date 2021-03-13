<template>
  <EditorPane :getTrack="playedTrack" :song="song" :track="track" />
</template>

<script>
import EditorPane from './EditorPane.vue'

export default {
  components: {
    EditorPane,
  },
  data() {
    return { song: {}, track: {} }
  },
}
</script>
