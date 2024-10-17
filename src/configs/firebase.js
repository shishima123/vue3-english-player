// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth'
import { child, get, getDatabase, ref, update } from 'firebase/database'

const firebaseConfig = {
  apiKey: 'AIzaSyC7Ojeojtk-sX0ULlH7yjqS3os5KJCXvZA',
  authDomain: 'vue3-english-player.firebaseapp.com',
  databaseURL: 'https://vue3-english-player-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'vue3-english-player',
  storageBucket: 'vue3-english-player.appspot.com',
  messagingSenderId: '641226859339',
  appId: '1:641226859339:web:41b5dcd6bd174d3f0abece'
}

const app = initializeApp(firebaseConfig)

export const FirebaseEnums = {
  permission_denied: 'Permission denied'
}
export function getDatabaseList(path) {
  const dbRef = ref(getDatabase())
  return get(child(dbRef, path))
    .then((snapshot) => {
      if (snapshot.exists()) {
        return snapshot.val()
      } else {
        return {}
      }
    })
    .catch((error) => {
      if (error.message === FirebaseEnums.permission_denied) {
        throw error
      }
      return {}
    })
}

export function setDatabaseList(path, data) {
  const db = getDatabase()
  const updates = {}
  updates[path] = data
  update(ref(db), updates)
}

const auth = getAuth()
export function signInFirebase(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      return userCredential.user
    })
    .catch((error) => {
      console.log(error)
      throw error
    })
}

onAuthStateChanged(auth, (user) => {})

export function getCurrentUser() {
  return auth.currentUser
}
