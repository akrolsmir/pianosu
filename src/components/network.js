import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyBtzuFRUOx9Asywn4vQzCFQ1_ypIPx4F6A',
  authDomain: 'piansou.firebaseapp.com',
  projectId: 'piansou',
  storageBucket: 'piansou.appspot.com',
  messagingSenderId: '576931281071',
  appId: '1:576931281071:web:515f13097d65aa91acfc5a',
  measurementId: 'G-JX18ZZFCDB',
}

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
  try {
    import('firebase/firebase-analytics').then(() => firebase.analytics())
  } catch (e) {
    console.warn('Firebase analytics not enabled (probably got blocked.)')
    // Shim for firebase.analytics().logEvent(...)
    firebase.analytics = () => ({
      logEvent() {
        // Do nothing
      },
    })
  }
}
export const db = firebase.firestore()

export async function setSong(song) {
  // Remove the virtual 'tracks' before uploading
  const songsCopy = { ...song }
  delete songsCopy['tracks']
  await db.collection('songs').doc(song.id).set(songsCopy)
}

/**
 * song: {
 *   id: summertime
 *   name: Summertime
 *   artist: Maggie & Nyan
 *   bpm, offset for now. future:
 *   timings: [
 *     { bpm: 120, offset: 940 }
 *   ]
 *   audio: http://...
 *
 *   tracks: [ (subcollection? nested?) {
 *     id: piano-easy
 *     name: Piano (Easy)
 *     creator: Austin
 *     instrument?: PIANO
 *     bgImage: http://...
 *     scale: [A#4, D#4, ...]
 *     keys?: ['A', 'S', 'D' ]
 *     notes: [
 *       { time: 1234, note: 'A#4 }
 *       ...
 *     ]
 *     }, ...
 *   ]
 * }
 */

export async function setTrack(songId, track) {
  await db
    .collection('songs')
    .doc(songId)
    .collection('tracks')
    .doc(track.id)
    .set(track)
}

export async function getTrack(songId, trackId) {
  const doc = await db.doc(`songs/${songId}/tracks/${trackId}`).get()
  return doc.data() || getDefaultTrack(songId)
}

// Return the oldest track for a song
export async function getDefaultTrack(songId) {
  const snapshot = await db
    .collection('songs')
    .doc(songId)
    .collection('tracks')
    .orderBy('lastUpdateTime')
    .limit(1)
    .get()

  return toArray(snapshot)[0]
}

export async function updateSong(id, toUpdate) {
  await db.collection('songs').doc(id).update(toUpdate)
}

export async function getSong(songId) {
  const doc = await db.collection('songs').doc(songId).get()
  return doc.data()
}

export async function listSongs(fillTracks = false) {
  const docs = await db
    .collection('songs')
    .orderBy('lastUpdateTime', 'desc')
    .limit(20)
    .get()

  const songs = toArray(docs)
  if (fillTracks) {
    for (const song of songs) {
      song.tracks = await tracksForSong(song.id)
    }
  }
  return songs
}

async function tracksForSong(songId) {
  const snapshot = await db.collection(`songs/${songId}/tracks`).get()
  return toArray(snapshot)
}

export async function listTracks() {
  const snapshot = await db
    .collectionGroup('tracks')
    .orderBy('lastUpdateTime', 'desc')
    .limit(40)
    .get()

  return toArray(snapshot)
}

function toArray(snapshot) {
  return snapshot.docs.map((doc) => doc.data())
}

// NOTE: if you change the bucket, you _may_ have to allow CORS access for Phaser...
// https://firebase.google.com/docs/storage/web/download-files#cors_configuration
const storage = firebase.storage()
export async function uploadAs(id, data, filename) {
  const ref = storage.ref(id).child(filename)
  // Uploaded files should be cached for 1 day, then revalidated
  // See https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
  const metadata = { cacheControl: 'public, max-age=86400, must-revalidate' }
  await ref.put(data, metadata)
  return await ref.getDownloadURL()
}
