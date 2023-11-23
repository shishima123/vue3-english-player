import { getDatabaseList, setDatabaseList } from '@/configs/firebase'

export async function syncDownload(syncFlagState = true) {
  if (!syncFlagState) {
    return
  }
  let dataSync = await getDatabaseList('sync')
  setLocalStorage(dataSync)
}

function setLocalStorage(dataSync) {
  Object.keys(dataSync).forEach(function (state) {
    localStorage[state] = dataSync[state]
  })
}

export async function syncUpload(data) {
  await setDatabaseList('sync', data)
}
