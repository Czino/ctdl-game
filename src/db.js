const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB

let db
let debug = false

export const init = dbg => {
  let freshlyMinted = false
  debug = dbg

  return new Promise((resolve, reject) => {
    let dbRequest = indexedDB.open('ctdl-game', 1000)
    dbRequest.onerror = event => {
      if (debug) console.log('Database error code: ', event)
      reject(event)
    }
    dbRequest.onsuccess = event => {
      db = event.target.result
      if (debug) console.log('Database connected', db)
      resolve(freshlyMinted)
    }
    dbRequest.onupgradeneeded = event => {
      db = event.target.result
      const objectStoreState = db.createObjectStore(
        'state', {
          'keyPath': 'id'
        }
      )
      objectStoreState.createIndex('id', 'id', {
        'unique': true
      })
      freshlyMinted = true
    }
  })
}

export const destroy = () => {
  return new Promise(resolve => {
    let dbRequest = indexedDB.deleteDatabase('app')
    dbRequest.onsuccess = () => {
      if (debug) console.log('Database destroyed')
      resolve()
    }
  })
}

export const set = (key, value) => {
  return new Promise(resolve => {
    let state = db.transaction(['state'], 'readwrite').objectStore('state')
    let updateRequest = state.get(key)

    updateRequest.onerror = () => {
      if (debug) console.log('Create entry', key, value)
      state.add({
        'id': key,
        'value': value
      })
      resolve()
    }
    updateRequest.onsuccess = () => {
      if (debug) console.log('Update entry', key, value)
      state.put({
        'id': key,
        'value': value
      })
      resolve()
    }
  })
}

export const get = key => {
  return new Promise(resolve => {
    let state = db.transaction(['state'], 'readonly').objectStore('state')
    let request = state.get(key);
    request.onerror = () => {
      resolve(null)
    }
    request.onsuccess = event => {
      // Get the old value that we want to update
      resolve(event.target.result ? event.target.result.value : null)
    }
  })
}