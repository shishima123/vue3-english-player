// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { child, get, getDatabase, ref, update } from 'firebase/database'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyC7Ojeojtk-sX0ULlH7yjqS3os5KJCXvZA',
  authDomain: 'vue3-english-player.firebaseapp.com',
  databaseURL: 'https://vue3-english-player-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'vue3-english-player',
  storageBucket: 'vue3-english-player.appspot.com',
  messagingSenderId: '641226859339',
  appId: '1:641226859339:web:41b5dcd6bd174d3f0abece'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export function getDataSync() {
  const dbRef = ref(getDatabase())
  return get(child(dbRef, `sync`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        return snapshot.val()
      } else {
        return {}
      }
    })
    .catch((error) => {
      console.error(error)
      return {}
    })
}

export function setDataSync(data) {
  const db = getDatabase()
  const updates = {}
  updates['/sync'] = data
  update(ref(db), updates)
}
