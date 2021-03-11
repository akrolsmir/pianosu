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
  await db.collection('songs').doc(song.id).set(song)
}

export async function updateSong(id, toUpdate) {
  await db.collection('songs').doc(id).update(toUpdate)
}

export async function getSong(songId) {
  const doc = await db.collection('songs').doc(songId).get()
  return doc.data()
}

export async function listSongs() {
  const docs = await db
    .collection('songs')
    .orderBy('lastUpdateTime', 'desc')
    .limit(20)
    .get()

  const songs = []
  docs.forEach((doc) => songs.push(doc.data()))
  return songs
}

// NOTE: if you change the bucket, you _may_ have to allow CORS access for Phaser...
// https://firebase.google.com/docs/storage/web/download-files#cors_configuration
const storage = firebase.storage()
export async function uploadAs(id, data, filename) {
  const ref = storage.ref(id).child(filename)
  await ref.put(data)
  return await ref.getDownloadURL()
}
