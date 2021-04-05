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
  color = 0xcccccc,
  alpha = 1
) {
  const rect = scene.add.rectangle(-100, -100, 30, 30, color, alpha)
  rect.setDepth(100)
  // Drag handlers
  rect.setInteractive({ draggable: true })
  rect.on('pointerover', () => (rect.fillColor = 0x34e388))
  rect.on('pointerout', () => (rect.fillColor = color))
  rect.on('dragstart', () => (rect.alpha = 0.7))
  rect.on('drag', (_pointer, dragX, dragY) => hitObject.adjustHitTime(dragY))
  rect.on('dragend', () => (rect.alpha = 1))
  // TODO: Place note on left click; delete note on right click

  let replayEvent
  let seekbarTime = 0

  const hitObject = {
    note,
    hitTime,
    rect,
    adjustHitTime(newY) {
      hitTime = (CO.TARGET_Y - newY) / CO.FALL_VELOCITY + seekbarTime
      this.resnap()
    },
    render(time) {
      const x = CO.OFFSET_X(note)
      // At hitTime, y should be TARGET_Y
      const y = CO.TARGET_Y - (hitTime - time) * CO.FALL_VELOCITY
      rect.setPosition(x, y)
      seekbarTime = time
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
    // Returns the serializable version
    toHit() {
      return { note, time: hitTime }
    },
    // Adjust hitTime to land on the specified divisor
    resnap(divisor = 16) {
      const { bpm, offset } = CO.SONG_DETAILS
      const interval = (60 * 1000) / ((bpm * divisor) / 4)
      hitTime = nearest(hitTime, interval, offset)
    },
    destroy() {
      rect.destroy()
    },
  }
  return hitObject
}

function nearest(time, interval, offset) {
  const delta = time - offset
  const multiple = Math.round(delta / interval)
  return Math.round(multiple * interval + offset)
}
