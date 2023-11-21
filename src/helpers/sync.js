import { getDataSync, setDataSync } from '@/configs/firebase'

export async function syncDownload(syncFlagState = true) {
  if (!syncFlagState) {
    return
  }
  let dataSync = await getDataSync()
  Object.keys(dataSync).forEach(function (state) {
    localStorage[state] = dataSync[state]
  })
}

export async function syncUpload(data) {
  await setDataSync(data)
}
