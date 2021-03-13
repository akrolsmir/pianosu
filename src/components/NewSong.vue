<template>
  <EditorPane :getTrack="playedTrack" :songDetails="song" />
</template>

<script>
import EditorPane from './EditorPane.vue'

export default {
  components: {
    EditorPane,
  },
  data() {
    return { song: {} }
  },
}
</script>
