let CO

export function passConstants(constants) {
  CO = constants
}

/**
 * hitObj: {
 *   note: 'D' // or 1, or 'F#4'?
 *   hitTime: 12345 // ms, when it should be hit
 *   rect: Phaser.GameObjects.Rectangle ref
 *   render(time) => { adjust rect's position }
 *   hit(time)?? => { replace with score object }
 * }
 */
export function makeHitObject(
  note,
  hitTime,
  /** @type {Phaser.Scene} */ scene,
  color = 0xaa4422,
  alpha = 1
) {
  const rect = scene.add.rectangle(-100, -100, 30, 30, color, alpha)
  rect.setDepth(100)

  let replayEvent

  return {
    note,
    hitTime,
    rect,
    render(time) {
      const x = CO.NOTES.indexOf(note) * 85 + 35 + 25
      // At hitTime, y should be TARGET_Y
      const y = CO.TARGET_Y - (hitTime - time) * CO.FALL_VELOCITY
      rect.setPosition(x, y)
    },
    // Schedule this note to be replayed when seekbar gets there
    schedule(seekbarTime) {
      const delay = hitTime - seekbarTime
      if (delay >= 0) {
        replayEvent = scene.time.addEvent({
          delay,
          callback: () => {
            CO.SYNTH.triggerAttackRelease(note, '8n')
          },
        })
      }
    },
    unschedule() {
      if (replayEvent) {
        replayEvent.destroy()
      }
    },
  }
}
