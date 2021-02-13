<template>
  <div>
    <h2>Playback extracted melody</h2>
    <button @click="play">Play music!</button>
  </div>
</template>

<script>
import * as Tone from 'tone'
import summertime15v from '../summertime15-voice.js'

export default {
  methods: {
    play() {
      const osc = new Tone.Oscillator().toDestination()

      osc.frequency.value = 400
      for (let i = 0; i < summertime15v.length; i++) {
        const time = i / 400 // Each tick is 1/400 of a second
        osc.frequency.linearRampToValueAtTime(summertime15v[i], time)
      }
      osc.start().stop('+16')
    },
  },
}
</script>
